import React, {Component} from 'react'
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
// import Select from 'react-select';
import * as salesAction  from '../../actions/salesAction';
import SessionManager from '../../components/session_manage';
// import DatePicker from "react-datepicker";
import Axios from 'axios';
import API from '../../components/api'
import { trls } from '../../components/translate';
// import Sweetalert from 'sweetalert';
import  Salesform  from './salesform'
import  Addproductform  from './addproduct_form';
import  Updateorderline  from './updateorderLine_fomr';
import  Updatetransport  from './update_transport';
import * as Common from '../../components/common';


const mapStateToProps = state => ({ 
    ...state,
});

const mapDispatchToProps = dispatch => ({
    getSalesOrder: (value) =>
        dispatch(salesAction.getSalesOrder(value)),
    getSalesItem: (value) =>
        dispatch(salesAction.getSalesItem(value)),
});

class Salesorderdtail extends Component {
    constructor(props) {
        super(props);
        this.state ={
            orderdate: '', 
            salesorderid:'',
            salesorder:[],
            salesItems:[],
            exactFlag: false,
            sendingFlag: false,
            salesTransport: []
        }
      }
    componentDidMount() {
        this.getSalesOrder();
        this.getSalesItem();
        this.getSalesOrderTransports();
    }

    componentWillUnmount() {
        this._isMounted = false
    }

    getSalesOrder() {
        var params={
            "salesorderid":this.props.location.state.newId
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
            Axios.post(API.GetSalesDetail, params, headers)
            .then(result => {
                this.setState({salesorder: result.data.Items[0]});
            });
    }

    getSalesItem () {
        var params={
            "orderid":this.props.location.state.newId
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
            Axios.post(API.GetSalesOrderLines, params, headers)
            .then(result => {
                this.setState({salesItems: result.data.Items})
            });
    }

    getSalesOrderTransports() {
        var params={
            "orderid":this.props.location.state.newId
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetSalesOrderTransports, params, headers)
        .then(result => {
            this.setState({salesTransport: result.data.Items})
        });
    }

    generateSalesInvoiceXmlExact = () => {
        this.setState({sendingFlag: true})
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            salesid: this.props.location.state.newId
        }
        Axios.post(API.PostSalesOrderExact, params, headers)
        .then(result => {
            Axios.get(API.GenerateProductXmlExact, headers)
            .then(result => {
                Axios.post(API.PostSalesOrderExactSend, params, headers)
                .then(result => {
                    this.setState({exactFlag: true, sendingFlag: false})
                });
            });
        });
    }

    orderLineEdit = (data) => {
        this.setState({upadateDate: data, showModalUpdate: true})
    }

    orderLineDelete = (id) => {
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            id: id
        }
        Axios.post(API.DeleteSalesOrderLine, params, headers)
        .then(result => {
            this.getSalesItem();
        });
    }

    transporterEdit = (data) => {
        this.setState({transportUpadateDate: data, transportShowModal: true})
    }

    transporterDelete = (id) => {
        console.log('555', id)
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            id: id
        }
        Axios.post(API.DeleteTransports, params, headers)
        .then(result => {
            this.getSalesOrderTransports();
        });
    }

    render () {
        let detailData = this.state.salesorder;
        let salesItems = this.state.salesItems;
        let transporter = this.state.salesTransport;
        console.log('1111', transporter)
        return (
            <div>
                <div className="content__header content__header--with-line">
                    <h2 className="title">{trls('Sales_Order_Details')}</h2>
                </div>
                <div className="place-and-orders">
                    <div className="place-and-orders__top">
                        <Container className="sales-details">
                            <Row>
                                <Col>
                                    <Form className="container product-form">
                                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                                {trls("Customer")}
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                {detailData &&(
                                                    <input type="text" readOnly defaultValue={detailData.Customer} className="input input-detail"/>
                                                )}
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                                {trls("Supplier")}
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                {detailData &&(
                                                    <input type="text" readOnly defaultValue={detailData.Supplier} className="input input-detail"/>
                                                )}
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                                {trls("Reference_customer")}
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                {detailData &&(
                                                    <input type="text" readOnly defaultValue={detailData.referencecustomer} className="input input-detail"/>
                                                )}
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                                {trls("Loading_date")}
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                {detailData.loadingdate ?(
                                                    <input type="text" readOnly defaultValue={Common.formatDate(detailData.loadingdate)} className="input input-detail"/>
                                                ): <input type="text" readOnly className="input input-detail"/>}
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} controlId="formPlaintextSupplier" >
                                            <Form.Label column sm="3">
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                <Button variant="primary" onClick={()=>this.setState({modalShow:true, exactFlag: false})} style={{width: 80, marginLeft: "auto", marginRight: -20, float: "right"}}>{trls("Edit")}</Button>
                                            </Col>
                                        </Form.Group>
                                    </Form>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    <div className="table-responsive">
                        <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                            <thead>
                                <tr>
                                    <th>{trls("Product")}</th>
                                    <th>{trls("Quantity")}</th>
                                    <th>{trls("Purchase_Price")}</th>
                                    <th>{trls("Sales_Price")}</th>
                                    <th>{trls("Purchase_Amount")}</th>
                                    <th>{trls("Sales_Amount")}</th>
                                    <th>{trls("Packing_slip_number")}</th>
                                    <th>{trls("Container_number")}</th>
                                    <th>{trls("ShippingDocumentnumber")}</th>
                                    <th >{trls("ReportingDate")}</th>
                                    <th>{trls("Action")}</th>
                                </tr>
                            </thead>
                            {salesItems && (<tbody>
                                {
                                    salesItems.map((data,i) =>(
                                    <tr id={data.id} key={i}>
                                        <td>{data.productcode}</td>
                                        <td>{data.quantity}</td>
                                        <td>{Common.formatMoney(data.SalesPrice)}</td>
                                        <td>{Common.formatMoney(data.purchaseprice)}</td>
                                        <td>{Common.formatMoney(data.purchaseamount)}</td>
                                        <td>{Common.formatMoney(data.SalesAmount)}</td>
                                        <td>{data.PackingSlip}</td>
                                        <td>{data.Container}</td>
                                        <td>{data.Shipping}</td>
                                        <td>{Common.formatDate(data.ReportingDate)}</td>
                                        <td >
                                            <Row style={{justifyContent:"center"}}>
                                                <i id={data.Id} className="far fa-trash-alt statu-item" onClick={()=>this.orderLineDelete(data.id)}></i>
                                                <i id={data.Id} className="fas fa-pen statu-item" onClick={()=>this.orderLineEdit(data)} ></i>
                                            </Row>
                                        </td>
                                    </tr>
                                ))
                                }
                            </tbody>)}
                    </table>
                    <Button variant="primary" style={{height: 40, borderRadius: 20, float: 'right'}} onClick={()=>this.setState({showModalProduct: true})}>{trls('Add')}</Button>
                </div>
                <div className="table-responsive">
                        <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                            <thead>
                                <tr>
                                    <th>{trls("Transporter")}</th>
                                    <th>{trls("Pricingtype")}</th>
                                    <th>{trls("Price")}</th>
                                    <th>{trls("Action")}</th>
                                    
                                </tr>
                            </thead>
                            {transporter && (<tbody>
                                {
                                    transporter.map((data,i) =>(
                                    <tr id={data.id} key={i}>
                                        <td>{data.Transporter}</td>
                                        <td>{data.pricingtype}</td>
                                        <td>{Common.formatMoney(data.price)}</td>
                                        <td >
                                            <Row style={{justifyContent:"center"}}>
                                                <i id={data.id} className="far fa-trash-alt statu-item" onClick={()=>this.transporterDelete(data.id)}></i>
                                                <i id={data.id} className="fas fa-pen statu-item" onClick={()=>this.transporterEdit(data)}></i>
                                            </Row>
                                        </td>
                                    </tr>
                                ))
                                }
                            </tbody>)}
                    </table>
                </div>
                <Salesform
                    show={this.state.modalShow}
                    onHide={() => this.setState({modalShow: false})}
                    salesOrder={this.state.salesorder}
                    getSalesOrderData={()=>this.getSalesOrder()}
                />
                <Addproductform
                    show={this.state.showModalProduct}
                    onHide={() => this.setState({showModalProduct: false})}
                    customercode={this.props.location.state.customercode}
                    suppliercode={this.props.location.state.suppliercode}
                    loadingdate={this.state.salesorder.loadingdate}
                    orderid={this.props.location.state.newId}
                    getSalesOrderLine={()=>this.getSalesItem()}
                    getTransport={()=>this.getSalesOrderTransports()}
                />
                <Updateorderline
                    show={this.state.showModalUpdate}
                    onHide={() => this.setState({showModalUpdate: false})}
                    updatedata={this.state.upadateDate}
                    getSalesOrderLine={()=>this.getSalesItem()}
                />
                <Updatetransport
                    show={this.state.transportShowModal}
                    onHide={() => this.setState({transportShowModal: false})}
                    updatedata={this.state.transportUpadateDate}
                    getSalesOrderLine={()=>this.getSalesItem()}
                />
            </div>
        </div>
        )
    };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Salesorderdtail);