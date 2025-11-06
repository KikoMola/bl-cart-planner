import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Table } from './pages/table/table';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },
    {
        path: 'table',
        component: Table,
    },
];
