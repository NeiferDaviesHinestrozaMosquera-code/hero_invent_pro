import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { MainLayout } from './layouts/main-layout';
import { Dashboard } from './pages/dashboard';
import { Products } from './pages/products';
import { Categories } from './pages/categories';
import { Inventory } from './pages/inventory';
import { Sales } from './pages/sales';
import { Purchases } from './pages/purchases';
import { Suppliers } from './pages/suppliers';
import { Reports } from './pages/reports';
import { Accounting } from './pages/accounting';
//import { Customer } from './pages/customer';
import { Customers } from './pages/customers';


const App: React.FC = () => {
  return (
    <MainLayout>
      <Switch>
        <Route exact path="/" component={Dashboard} />
        <Route path="/products" component={Products} />
        <Route path="/categories" component={Categories} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/sales" component={Sales} />
        <Route path="/purchases" component={Purchases} />
        <Route path="/suppliers" component={Suppliers} />
        <Route path="/reports" component={Reports} />
        <Route path="/accounting" component={Accounting} />
        <Route path="/customer" component={Customers} />
        <Redirect to="/" />
      </Switch>
    </MainLayout>
  );
};

export default App;