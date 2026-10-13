import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import './index.css'

import MenuPage from './pages/MenuPage'
import NotFound from './pages/NotFound'
import AuthGuard from './components/admin/AuthGuard'
import AdminLayout from './components/admin/AdminLayout'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Categories from './pages/admin/Categories'
import Items from './pages/admin/Items'
import ItemEdit from './pages/admin/ItemEdit'
import Settings from './pages/admin/Settings'

const qc=new QueryClient({defaultOptions:{queries:{retry:1,refetchOnWindowFocus:false}}})
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><QueryClientProvider client={qc}><BrowserRouter><Routes>
    <Route path="/" element={<MenuPage/>}/>
    <Route path="/admin/login" element={<Login/>}/>
    <Route path="/admin" element={<AuthGuard/>}><Route element={<AdminLayout/>}>
      <Route index element={<Dashboard/>}/><Route path="categories" element={<Categories/>}/><Route path="items" element={<Items/>}/>
      <Route path="items/new" element={<ItemEdit/>}/><Route path="items/:id" element={<ItemEdit/>}/><Route path="settings" element={<Settings/>}/></Route></Route>
    <Route path="*" element={<NotFound/>}/>
  </Routes></BrowserRouter><Toaster position="top-center" dir="rtl" richColors/></QueryClientProvider></React.StrictMode>)
