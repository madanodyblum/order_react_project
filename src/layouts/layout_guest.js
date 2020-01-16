import React, {Component} from 'react'
import { Row } from 'react-bootstrap';
import { Col } from 'react-bootstrap';
import Sidebar from '../components/sidebar'
import Header from '../components/header'
import User from '../pages/User/user_register'
import Product from '../pages/Product/product'
import Productdetail from '../pages/Product/product_detail'
import Salesorderdetail from '../pages/Sales/selesorder_detail'
import Salesorder from '../pages/Sales/sales_order'
import Purchaseorder from '../pages/Purchase/purchase_order'
import Purchaseorderdetail from '../pages/Purchase/purchaseorder_detail'
import Taskoverview from '../pages/Task/task_overview'
import Qualityoverview from '../pages/Quality/quality_overview'
import { Switch,Router, Route } from 'react-router-dom';
import history from '../history';

window.localStorage.setItem('AWT', true);
class Layout extends Component {
  
    render () {
      return (
          <Row style={{height:"100%"}}>
            <Sidebar/>
            <Col style={{paddingLeft:0, paddingRight:0}}>
            <Header/>
                <Router history={history}>
                  <Switch>
                    <Route path="/user" component={User}/>
                    <Route path="/product" component={Product}/>
                    <Route path="/product-detail" component={Productdetail}/>
                    <Route path="/sales-order" component={Salesorder} />
                    <Route path="/sales-order-detail" component={Salesorderdetail}/>
                    <Route path="/purchase-order" component={Purchaseorder}/>
                    <Route path="/purchase-order-detail" component={Purchaseorderdetail}/>
                    <Route path="/task-overview" component={Taskoverview}/>
                    <Route path="/quality-overview" component={Qualityoverview}/>
                  </Switch>
                </Router>
            </Col>
          </Row>
      )
    };
  }
  export default Layout;
