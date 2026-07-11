import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Stores } from './pages/stores/stores';
import { Table } from './pages/table/table';

export const routes: Routes = [
    {
        path: '',
        component: Home,
    },
    {
        path: 'stores',
        component: Stores,
    },
    {
        path: 'table',
        component: Table,
    },
];
