import React, {Component} from 'react'
import { Container, Row, Col, Form, Button, Spinner} from 'react-bootstrap';
import { connect } from 'react-redux';
import SessionManager from '../../components/session_manage';
import Axios from 'axios';
import API from '../../components/api'
import { trls } from '../../components/translate';
import Purchaseform  from './purchaseform'
import Addpurchaseform  from './addpruchase_form'
import * as Common from '../../components/common'
import FlashMassage from 'react-flash-message'

const mapStateToProps = state => ({ 
    ...state,
});

const mapDispatchToProps = dispatch => ({

});

class Purchaseorderdtail extends Component {
    constructor(props) {
        super(props);
        this.state ={
            orderdate: '', 
            salesorderid:'',
            purchaseOrder:[],
            exactFlag: false,
            sendingFlag: false,
            purchaseOrderLine: [],
            totalAmount: 0,
            supplierCode: ''
        }
      }
    componentDidMount() {
        this.getPurchaseOrder();
        this.getPurchaseOrderLines();
    }
    getPurchaseOrder() {
        var params= {
            "purchaseorderid":this.props.location.state.newId
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetPurchaseOrder, params, headers)
        .then(result => {
            this.setState({purchaseOrder: result.data.Items[0]});
            if(!result.data.Items[0].istransport){
                Axios.get(API.GetSuppliersDropdown, headers)
                .then(result => {
                    let supplierData = result.data.Items;
                    let supplierCode = '';
                    supplierData.map((supplier, index)=>{
                        if(supplier.value===this.state.purchaseOrder.Customer){
                            supplierCode = supplier.key;
                        }
                        return supplierData;
                    });
                    this.setState({supplierCode: supplierCode})
                });
            }else{
                Axios.get(API.GetTransportersDropdown, headers)
                .then(result => {
                    
                    let supplierData = result.data.Items;
                    let supplierCode = '';
                    supplierData.map((supplier, index)=>{
                        if(supplier.Value===this.state.purchaseOrder.Customer){
                            supplierCode = supplier.Key;
                        }
                        return supplierData;
                    });
                    this.setState({supplierCode: supplierCode})
                });
            }
            this.setState({purchaseOrder: result.data.Items[0]});
        });
    }

    getPurchaseOrderLines () {
        var params = {
            purchaseorderid:this.props.location.state.newId
        }
        var headers = SessionManager.shared().getAuthorizationHeader();
        Axios.post(API.GetPurchaseOrderLines, params, headers)
        .then(result => {
            console.log('333333', result)
            let totalAmount = 0;
            result.data.Items.map((data, index)=>{
                totalAmount += data.amount
                return data;
            });
            this.setState({purchaseOrderLine: result.data.Items, totalAmount: totalAmount})
        });
    }
    
    componentWillUnmount() {
        this._isMounted = false
    }
    
    generatePurchaseInvoiceXmlExact = () => {
        this.setState({sendingFlag: true})
        var headers = SessionManager.shared().getAuthorizationHeader();
        var params = {
            purchaseid: this.props.location.state.newId
        }
        Axios.post(API.PostPurchaseOrderExact, params, headers)
        .then(result => {
            Axios.get(API.GenerateProductXmlExact, headers)
            .then(result => {
                Axios.post(API.PostPurchaseOrderExactSend, params, headers)
                .then(result => {
                    this.setState({exactFlag: true, sendingFlag: false})
                });
            });
        });
    }

    render () {
        let detailData = [];
        if(this.state.purchaseOrder){
            detailData = this.state.purchaseOrder;
        }
        console.log('3333', this.props.location)
        return (
            <div>
                <div className="content__header content__header--with-line">
                    <h2 className="title">{trls('Purchase_Order_Details')}</h2>
                </div>
                <div className="place-and-orders">
                {this.state.exactFlag&&(
                    <div>
                        <FlashMassage duration={2000}>
                            <div className="alert alert-success" style={{marginTop:10}}>
                                <strong><i className="fas fa-check-circle"></i> Success!</strong>
                            </div>
                        </FlashMassage>
                    </div>
                )
                }
                {this.state.sendingFlag&&(
                    <div style={{marginTop:10}}><Spinner animation="border" variant="info"/><span style={{marginTp:10, fontWeight: "bold", fontSize: 16}}> {trls('Sending')}...</span></div>
                )}
                <Button variant="primary" onClick={()=>this.generatePurchaseInvoiceXmlExact()} style={{marginTop: 20}}>{trls("Send_to_Exact")}</Button>
                    <div className="place-and-orders__top">
                        <Container className="sales-details">
                            <Row>
                                <Col sm={6}>
                                    <Form className="container product-form">
                                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                                {trls("Supplier")}
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                {detailData &&(
                                                    <input type="text" readOnly defaultValue={detailData.Customer} className="input input-detail"/>
                                                )}
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                                {trls("Invoice")}
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                {detailData &&(
                                                    <input type="text" readOnly defaultValue={detailData.invoicenr} className="input input-detail"/>
                                                )}
                                            </Col>
                                        </Form.Group>
                                            <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                                {trls("Invoice_date")}
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                {detailData.invoicedate ?(
                                                    <input type="text" readOnly defaultValue={Common.formatDate(detailData.invoicedate)} className="input input-detail"/>
                                                ): <input type="text" readOnly className="input input-detail"/>}
                                            </Col>
                                        </Form.Group>
                                    </Form>
                                </Col>
                                <Col sm={6}>
                                    <Form className="container product-form">
                                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                                {trls("Description")}
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                {detailData &&(
                                                    <input type="text" readOnly defaultValue={ detailData.description} className="input input-detail"/>
                                                )}
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                                {trls("IsTransport")}
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                {/* <i className="fas fa-circle inactive-icon"></i><div>Inactive</div> */}
                                                {detailData &&(
                                                    <Form.Check type="checkbox" disabled style={{padding: 10, marginLeft: 33}} defaultChecked={detailData.istransport} name="transport" />
                                                )}
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row} controlId="formPlaintextSupplier">
                                            <Form.Label column sm="3">
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                <Button variant="primary" style={{float: "right", marginRight: -20}} onClick={()=>this.setState({modalShow:true, exactFlag: false})}>{trls('Edit')}</Button>
                                            </Col>
                                        </Form.Group>
                                        
                                    </Form>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                    <div className="table-responsive">
                        {!this.state.purchaseOrder.istransport ? (
                            <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                                <thead>
                                    <tr>
                                        <th>{trls('Product')}</th>
                                        <th>{trls('Quantity')}</th>
                                        <th>{trls('Price')}</th>
                                        <th>{trls('Amount')}</th>
                                        <th>{trls('Reporting_Date')}</th>
                                        </tr>
                                </thead>
                                {this.state.purchaseOrderLine && (<tbody>
                                    {
                                        this.state.purchaseOrderLine.map((data,i) =>(
                                        <tr id={data.id} key={i}>
                                            <td>{data.productcode}</td>
                                            <td>{data.quantity}</td>
                                            <td>{Common.formatMoney(data.price)}</td>
                                            <td>{Common.formatMoney(data.amount)}</td>
                                            <td>{Common.formatDate(data.reportingdate)}</td>
                                        </tr>
                                    ))
                                    }
                                    <tr style={{backgroundColor: 'rgb(157, 202, 159)', fontWeight: 'bold'}}>
                                        <td>{trls('Total')}</td>
                                        <td></td>
                                        <td></td>
                                        <td>{Common.formatMoney(this.state.totalAmount)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>)}
                            </table>
                        ):
                            <table id="example" className="place-and-orders__table table table--striped prurprice-dataTable" width="100%">
                                <thead>
                                    <tr>
                                        <th>{trls('Product')}</th>
                                        <th>{trls('Quantity')}</th>
                                        <th>{trls('Pricingtype')}</th>
                                        <th>{trls('Price')}</th>
                                        <th>{trls('Reporting_Date')}</th>
                                        </tr>
                                </thead>
                                {this.state.purchaseOrderLine && (<tbody>
                                    {
                                        this.state.purchaseOrderLine.map((data,i) =>(
                                        <tr id={data.id} key={i}>
                                            <td>{data.productcode}</td>
                                            <td>{data.quantity}</td>
                                            <td>{Common.formatMoney(data.price)}</td>
                                            <td>{Common.formatMoney(data.amount)}</td>
                                            <td>{Common.formatDate(data.reportingdate)}</td>
                                        </tr>
                                    ))
                                    }
                                    <tr style={{backgroundColor: 'rgb(157, 202, 159)', fontWeight: 'bold'}}>
                                        <td>{trls('Total')}</td>
                                        <td></td>
                                        <td></td>
                                        <td>{Common.formatMoney(this.state.totalAmount)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>)}
                            </table>
                        }
                        
                    <Button variant="primary" style={{height: 40, borderRadius: 20, float: 'right'}} onClick={()=>this.setState({showModalPurchaase: true})}>{trls('Add')}</Button>
                </div>
                    <Purchaseform
                        show={this.state.modalShow}
                        onHide={() => this.setState({modalShow: false})}
                        purchaseData={this.state.purchaseOrder}
                        getPurchaseOrder={()=>this.getPurchaseOrder()}
                    />
                    <Addpurchaseform
                        show={this.state.showModalPurchaase}
                        onHide={() => this.setState({showModalPurchaase: false})}
                        suppliercode={this.state.supplierCode}
                        purchaseid={this.props.location.state.newId}
                        getPurchaseOrderLines={()=>this.getPurchaseOrderLines()}
                        transport={this.state.purchaseOrder.istransport}
                    />
                </div>
            </div>
        )
        };
  }
  export default connect(mapStateToProps, mapDispatchToProps)(Purchaseorderdtail);