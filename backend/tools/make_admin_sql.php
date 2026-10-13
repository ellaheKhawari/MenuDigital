<?php
// روی کامپیوتر خودت اجرا کن (نه روی سرور):
//   php make_admin_sql.php email password            → دستور INSERT
//   php make_admin_sql.php email password update     → دستور UPDATE (بازیابی رمز)
// خروجی را در phpMyAdmin اجرا کن.
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
[$_, $email, $pass, $mode] = array_pad($argv, 4, null);
if (!$email || !$pass || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($pass) < 10) {
    fwrite(STDERR, "استفاده: php make_admin_sql.php email password(حداقل ۱۰ کاراکتر) [update]\n");
    exit(1);
}
$algo = defined('PASSWORD_ARGON2ID') ? PASSWORD_ARGON2ID : PASSWORD_BCRYPT;
$hash = password_hash($pass, $algo, $algo === PASSWORD_BCRYPT ? ['cost' => 12] : []);
$e = str_replace("'", "''", $email);
echo $mode === 'update'
    ? "UPDATE admins SET password_hash = '$hash' WHERE email = '$e';\n"
    : "INSERT INTO admins (email, password_hash) VALUES ('$e', '$hash');\n";
