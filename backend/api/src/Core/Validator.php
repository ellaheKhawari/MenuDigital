<?php
declare(strict_types=1);
namespace App\Core;

/** قواعد: required, type(string|int|bool|intlist), min, max, regex, email, nullable, collapse, label */
final class Validator
{
    public static function make(array $in, array $rules): array
    {
        $out = [];
        $err = [];
        foreach ($rules as $f => $r) {
            $label = (string)($r['label'] ?? $f);
            if (!array_key_exists($f, $in)) {
                if (!empty($r['required'])) {
                    $err[$f] = "$label الزامی است";
                }
                continue;
            }
            $v = $in[$f];
            if (is_string($v) && ($r['type'] ?? 'string') === 'string') {
                $v = trim($v);
                if (!empty($r['collapse'])) {
                    $v = preg_replace('/\s+/u', ' ', $v) ?? $v;
                }
                if ($v === '' && !empty($r['nullable'])) {
                    $v = null;
                }
            }
            if ($v === null) {
                if (!empty($r['nullable'])) {
                    $out[$f] = null;
                } else {
                    $err[$f] = "$label الزامی است";
                }
                continue;
            }
            $e = self::check($r, $label, $v);
            if ($e !== null) {
                $err[$f] = $e;
            } else {
                $out[$f] = $v;
            }
        }
        if ($err) {
            throw new HttpException(422, 'داده‌ی نامعتبر', $err);
        }
        return $out;
    }

    private static function check(array $r, string $label, mixed &$v): ?string
    {
        switch ($r['type'] ?? 'string') {
            case 'string':
                if (!is_string($v)) return "$label باید متن باشد";
                $len = mb_strlen($v);
                if ($v === '' && !empty($r['required'])) return "$label الزامی است";
                if (isset($r['min']) && $len < $r['min']) return "$label باید حداقل {$r['min']} کاراکتر باشد";
                if (isset($r['max']) && $len > $r['max']) return "$label باید حداکثر {$r['max']} کاراکتر باشد";
                if (isset($r['regex']) && !preg_match($r['regex'], $v)) return "$label معتبر نیست";
                if (!empty($r['email']) && !filter_var($v, FILTER_VALIDATE_EMAIL)) return "$label معتبر نیست";
                return null;
            case 'int':
                if (is_string($v) && preg_match('/^\d{1,10}$/', $v)) $v = (int)$v;
                if (!is_int($v)) return "$label باید عدد صحیح باشد";
                if ((isset($r['min']) && $v < $r['min']) || (isset($r['max']) && $v > $r['max'])) {
                    return "$label باید بین {$r['min']} و {$r['max']} باشد";
                }
                return null;
            case 'bool':
                return is_bool($v) ? null : "$label باید true یا false باشد";
            case 'intlist':
                if (!is_array($v) || !array_is_list($v) || $v === []) return "$label باید فهرست غیرخالی از عدد باشد";
                foreach ($v as $x) {
                    if (!is_int($x) || $x < 1) return "$label فقط شامل شناسه‌های عددی باشد";
                }
                return null;
        }
        return "$label نامعتبر است";
    }
}
