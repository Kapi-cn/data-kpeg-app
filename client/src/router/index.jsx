import { Route } from '@solidjs/router';
import { lazy } from 'solid-js';

import AppLayout from '../components/layout/AppLayout';

const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const KegiatanPage = lazy(() => import('../pages/ListKegiatanPage'));
const FormKegiatanPage = lazy(() => import('../pages/FormKegiatanPage'));

const LoginPage = lazy(() => import('../pages/LoginPage'));

export default function AppRouter() {
  return (
    <>
      <Route component={AppLayout}>
        <Route path='/' component={DashboardPage} />
        <Route path='/kegiatan' component={KegiatanPage} />
        <Route path='/kegiatan/baru' component={FormKegiatanPage} />
        <Route path='/kegiatan/edit' component={FormKegiatanPage} />
        <Route path='/kegiatan/edit/:id' component={FormKegiatanPage} />
        <Route path='*404' component={DashboardPage} />
      </Route>

      <Route path='/login' component={LoginPage} />
    </>
  );
}
