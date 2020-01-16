import React, {Component} from 'react'
import { connect } from 'react-redux';
import { Button, Form } from 'react-bootstrap';
import  Purchaseform  from './purchaseform'
import { BallBeat } from 'react-pure-loaders';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import 'datatables.net';
import $ from 'jquery';
import history from '../../history';
import * as Common from '../../components/common'

const mapStateToProps = state => ({
     ...state.auth,
});

const mapDispatchToProps = dispatch => ({

}); 

class Purchaseorder extends Component {
    _isMounted = false
    constructor(props) {
        super(props);
        this.state = {  
            purhaseorders:[],
            loading:true
        };
      }
componentDidMount() {
    this.getPurchaseOrders();
}

componentWillUnmount() {
}
getPurchaseOrders() {
    var headers = SessionManager.shared().getAuthorizationHeader();
    Axios.get(API.GetPurchaseOrders, headers)
    .then(result => {
        this.setState({purhaseorders: result.data.Items});
        this.setState({loading:false})
        $('#example').dataTable().fnDestroy();
        $('#example').DataTable(
            {
              "language": {
                  "lengthMenu": trls("Show")+" _MENU_ "+trls("Entries"),
                  "zeroRecords": "Nothing found - sorry",
                  "info": trls("Show_page")+" _PAGE_ of _PAGES_",
                  "infoEmpty": "No records available",
                  "infoFiltered": "(filtered from _MAX_ total records)",
                  "search": trls('Search'),
                  "paginate": {
                    "previous": trls('Previous'),
                    "next": trls('Next')
                  }
              }
            }
          );
    });
}

loadPurchaseDetail = (data) =>{
    history.push({
        pathname: '/purchase-order-detail',
        state: { newId: data.id, supplierCode:'', newSubmit:true}
    })
}

render () {
    let salesData = this.state.purhaseorders;
    salesData.sort(function(a, b) {
        return a.id - b.id;
    });
    return (
        <div className="order_div">
            <div className="content__header content__header--with-line">
                <h2 className="title">{trls('Purchase_Order')}</h2>
            </div>
            <div className="orders">
                <div className="orders__filters justify-content-between">
                    <Form inline style={{width:"100%"}}>
                        <Button variant="primary" onClick={()=>this.setState({modalShow:true})}>{trls('Add_Pursase_Order')}</Button>   
                        <Purchaseform
                            show={this.state.modalShow}
                            onHide={() => this.setState({modalShow: false})}
                        />
                    </Form>
                </div>
                <div className="table-responsive purchase-order-table">
                    <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                        <thead>
                            <tr>
                                <th>{trls('Id')}</th>
                                <th>{trls('Supplier')}</th>
                                <th>{trls('Invoice')}</th>
                                <th>{trls('Invoice_date')}</th>
                                <th>{trls('IsTransport')}</th>
                                <th>{trls('Total_amount')}</th>
                                
                            </tr>
                        </thead>
                        {salesData && !this.state.loading &&(<tbody>
                            {
                                salesData.map((data,i) =>(
                                <tr id={data.id} key={i}>
                                    <td>{data.id}</td>
                                    <td>
                                        <div id={data.id} style={{cursor: "pointer", color:'#004388', fontSize:"14px", fontWeight:'bold'}} onClick={()=>this.loadPurchaseDetail(data)}>{data.Supplier}</div>
                                    </td>
                                    <td>{data.invoicenr}</td>
                                    <td>{Common.formatDate(data.invoicedate)}</td>
                                    <td><Form.Check type="checkbox" disabled defaultChecked={data.istransport} name="transport" /></td>
                                    <td>{Common.formatMoney(data.total)}</td>
                                </tr>
                            ))
                            }
                        </tbody>)}
                    </table>
                    { this.state.loading&& (
                        <div className="col-md-4 offset-md-4 col-xs-12 loading" style={{textAlign:"center"}}>
                            <BallBeat
                                color={'#222A42'}
                                loading={this.state.loading}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
};
}
export default connect(mapStateToProps, mapDispatchToProps)(Purchaseorder);
