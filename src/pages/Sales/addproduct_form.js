import React, {Component} from 'react'
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import { trls } from '../../components/translate';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import DatePicker from "react-datepicker";
import * as Common from '../../components/common'

const mapStateToProps = state => ({ 
    ...state.auth,
});

const mapDispatchToProps = (dispatch) => ({

});

class Addproduct extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {  
            val1: '',
            productListData: [],
            purchasePrice: 0,
            salesPrice: 0,
            viewFieldFlag: false,
            purchaseAmount: 0,
            salesAmount: 0,
            reportingDate: new Date(),
            productQuantity: 0,
            orderLineId: ''
        };
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    componentDidMount() {
        this.getProductList();
    }

    handleSubmit = (event) => {
        event.preventDefault();
        const clientFormData = new FormData(event.target);
        const data = {};
        let params = [];
        for (let key of clientFormData.keys()) {
            data[key] = clientFormData.get(key);
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        if(!this.state.viewFieldFlag){
            params = {
                orderid: this.props.orderid,
                productid: data.product,
                quantity: data.quantity
            }
            Axios.post(API.PostSalesOrderLine, params, headers)
            .then(result => {
                this.setState({orderLineId: result.data.NewId})
                var transParams = {
                    orderid: this.props.orderid,
                    productid: data.product,
                    quantity: data.quantity,
                    loadingdate: this.props.loadingdate
                }
                Axios.post(API.PostTransports, transParams, headers)
                .then(result => {
                    this.props.getTransport();
                    this.setState({purchaseAmount: this.state.productQuantity*this.state.purchasePrice, salesAmount: this.state.productQuantity*this.state.salesPrice, viewFieldFlag: true})
                });
            });
        }else{
            params = {
                orderlineid: this.state.orderLineId,
                purchasePrice: data.purchaseprice,
                salesPrice: data.salesprice,
                quantity: data.quantity,
                purchaseAmount: data.purhcaseamount,
                salesAmount: data.salesamount,
                packingslip: data.packingslip,
                container: data.container,
                shipping: data.shippingdocumentnumber,
                reporting: Common.formatDateSecond(data.reporingdate)
            }
            Axios.post(API.PutSalesOrderLine, params, headers)
            .then(result => {
                this.onHide();
            });
        }
    }

    onHide = () => {
        this.setState({
            purchasePrice: 0,
            salesPrice: 0,
            viewFieldFlag: false,
            purchaseAmount: 0,
            salesAmount: 0,
            reportingDate: new Date(),
            productQuantity: 0,
            orderLineId: ''
        })
        this.props.onHide();
        this.props.getSalesOrderLine();
    }
    getProductList = () =>{
        this._isMounted = true;
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            customercode: this.props.customercode,
            suppliercode: this.props.suppliercode
        }
        Axios.post(API.GetSalesItems, params, headers)
        .then(result => {
            if(this._isMounted){
                let product = result.data.Items.map( s => ({value:s.key,label:s.value}));
                this.setState({productListData: product});
            }
        });
    }

    changeProduct = (val) => {
        this._isMounted = true;
        this.setState({val1: val.value});
        var headers = SessionManager.shared().getAuthorizationHeader();
        var purparams = {
            productid: val.value,
            loadingdate: this.props.loadingdate
        }
        var salparams = {
            productid: val.value,
            orderdate: this.props.loadingdate
        }
        Axios.post(API.GetPurchasePrice, purparams, headers)
        .then(result => {
            if(this._isMounted){
                this.setState({purchasePrice: result.data.Items[0].price});
            }
        });
        Axios.post(API.GetSalesPrice, salparams, headers)
        .then(result => {
            if(this._isMounted){
                this.setState({salesPrice: result.data.Items[0].price});
            }
        });
    }

    changeQauntity = (event) => {
        this.setState({productQuantity: event.target.value})
    }

    render(){
        return (
            <Modal
                show={this.props.show}
                onHide={()=>this.onHide()}
                size="xl"
                aria-labelledby="contained-modal-title-vcenter"
                backdrop= "static"
                centered
            >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    {trls('Add')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form className="container product-form" onSubmit = { this.handleSubmit }>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("Product")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Select
                                name="product"
                                options={this.state.productListData}
                                onChange={val => this.changeProduct(val)}
                            />
                            {!this.props.disabled && (
                                <input
                                    onChange={val=>console.log()}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    style={{ opacity: 0, height: 0 }}
                                    value={this.state.val1}
                                    required
                                />
                            )}
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} controlId="formPlaintextPassword">
                        <Form.Label column sm="3">
                            {trls("Quantity")}  
                        </Form.Label>
                        <Col sm="9" className="product-text">
                            <Form.Control type="number" name="quantity" required defaultValue={this.state.productQuantity} placeholder={trls("Quantity")} onChange = {(val)=>this.changeQauntity(val)} />
                        </Col>
                    </Form.Group>
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                                {trls("Purchase_Price")}  
                            </Form.Label>
                            <Col sm="9" className="product-text"> 
                                <Form.Control type="text" name="purchaseprice" defaultValue={this.state.purchasePrice} readOnly placeholder={trls("Purchase_Price")} />
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                                {trls("Sales_Price")}  
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Form.Control type="text" name="salesprice" defaultValue={this.state.salesPrice} readOnly placeholder={trls("Sales_Price")} />
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                                {trls("Purchase_Amount")}  
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Form.Control type="text" name="purhcaseamount" defaultValue={this.state.purchaseAmount} readOnly placeholder={trls("Purchase_Amount")} />
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                                {trls("Sales_Amount")}  
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Form.Control type="text" name="salesamount" defaultValue={this.state.salesAmount} readOnly placeholder={trls("Sales_Amount")} />
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                                {trls("Packing_slip_number")}  
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Form.Control type="text" name="packingslip" placeholder={trls("Packing_slip_number")} />
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                                {trls("Container_number")}  
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Form.Control type="text" name="container" placeholder={trls("Container_number")} />
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                                {trls("ShippingDocumentnumber")}  
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <Form.Control type="text" name="shippingdocumentnumber" placeholder={trls("ShippingDocumentnumber")} />
                            </Col>
                        </Form.Group>
                    )}
                    {this.state.viewFieldFlag&&(
                        <Form.Group as={Row} controlId="formPlaintextPassword">
                            <Form.Label column sm="3">
                                {trls('ReportingDate')}   
                            </Form.Label>
                            <Col sm="9" className="product-text">
                                <DatePicker name="reporingdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.reportingDate} onChange={date =>this.setState({reportingDate:date, invoicedateflag: true})} />
                            </Col>
                        </Form.Group>
                    )}
                    <Form.Group style={{textAlign:"center"}}>
                        <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                    </Form.Group>
                </Form>
            </Modal.Body>
            </Modal>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(Addproduct);