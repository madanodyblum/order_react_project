import React, {Component} from 'react'
import $ from 'jquery';
import { getUserToken } from '../../components/auth';
import { trls } from '../../components/translate';
import { Button } from 'react-bootstrap';
import { Modal } from 'react-bootstrap';
import { Form, Row, Col} from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { connect } from 'react-redux';
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import SessionManager from '../../components/session_manage';
import API from '../../components/api'
import Axios from 'axios';
import * as authAction  from '../../actions/authAction';
import ListErrors from '../../components/listerrors';
import * as Common from '../../components/common'

const mapStateToProps = state => ({ ...state.auth });

const mapDispatchToProps = dispatch => ({
    postPriceError: (params) =>
        dispatch(authAction.dataServerFail(params)),
    removeState: () =>
        dispatch(authAction.blankdispatch()),
});
class Productform extends Component {
      constructor(props) {
          super(props);
          this.state = {  
              token: window.localStorage.getItem('token'),
              transportlist:[],
              modalShow: false,
              redirect: false,
              startdate: '',
              enddate: '',
              product_id: "",
              transprot_key: "",
              pricetype: "",
              title: ""
          };
        }
      componentWillUnmount() {
        this._isMounted = false;
      }
      handleSubmit = (event) => {
          let url=""
          event.preventDefault();
          const clientFormData = new FormData(event.target);
          const data = {};
          for (let key of clientFormData.keys()) {
          data[key] = clientFormData.get(key);
          }
          this.setState({token:data.token});
          let param ={
            productid: this.props.productid
          }
          if(this.props.price_flag!==3){
                if(this.props.price_flag===1){
                    url="https://app-test.organisatie.freepeat.com/api/factory/execute/Appmakerz-Test/postPurchasePrice";
                }else if(this.props.price_flag===2){
                    url="https://app-test.organisatie.freepeat.com/api/factory/execute/Appmakerz-Test/postSalesPrice";
                }
                const settings = {
                    "async": true,
                    "crossDomain": true,
                    "url": url,
                    "method": "POST",
                    "headers": {
                    "Content-Type": "application/json",
                    "Authorization":"Bearer "+getUserToken(),
                    "Accept": "*/*",
                    },
                    "processData": false,
                    "data": "{\n\t\"productid\":"+this.props.productid+",\n\t\"startdate\":\""+Common.formatDateSecond(data.startdate)+"\",\n\t\"enddate\":\""+Common.formatDateSecond(data.enddate)+"\",\n\t\"price\":"+data.price+"\n}"
                }
                $.ajax(settings).done(function (response) {
                })
                .then(response => {
                    if(response.Success===true){
                        this.setState({
                            startdate:'',
                            enddate:''
                        })
                        var headers = SessionManager.shared().getAuthorizationHeader();
                        Axios.post(API.PostPricechangeTask, param, headers)
                        .then(result => {
                            console.log("OK");
                        });
                        this.props.onHide();
                        if(this.props.price_flag===1){
                            this.props.onGetPurchasePrice();
                        }else if(this.props.price_flag===2){
                            this.props.onGetSalesPrice();
                        }
                    }
                })
            }else{
                let params = {
                    productid: this.props.productid,
                    startdate: Common.formatDateSecond(data.startdate),
                    enddate: Common.formatDateSecond(data.enddate),
                    pricingType: data.pricingtype,
                    transporter: data.transport,
                    price: data.price
                }
                var headers = SessionManager.shared().getAuthorizationHeader();
                Axios.post(API.PostTransportPrice, params, headers)
                .then(result => {
                    if(result.data.Success){
                        this.setState({
                            startdate:'',
                            enddate:''
                        })
                        var headers = SessionManager.shared().getAuthorizationHeader();
                        Axios.post(API.PostPricechangeTask, param, headers)
                        .then(result => {
                            console.log("OK");
                        });
                        this.props.onHide();
                        this.props.removeState();
                        this.props.onGetTransportPrice()
                    }else{
                        this.props.postPriceError(trls("Please_set_pricetype"))
                    }
                    
                });
            }
        }
    componentDidMount() {
        const data = {
            "url": "https://app-test.organisatie.freepeat.com/api/factory/execute/Exact-Test/getTransportersDropdown",
            "method": "GET",
            "headers": {
              "Content-Type": "application/x-www-form-urlencoded",
              "Authorization":"Bearer "+getUserToken()
            }
          }
        $.ajax(data).done(function (response) {
        })
        .then(response => {
              this.setState({transportlist: response.Items})
        })
    }
    onHide = () => {
        this.props.onHide();
        this.props.removeState();
    }
    render(){
        if(this.props.price_flag===1){
            return (
                <Modal
                    show={this.props.show}
                    onHide={this.onHide}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    backdrop= "static"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {trls("Purchase_Price")}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                            <Form className="container product-form" onSubmit = { this.handleSubmit }>
                                
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">
                                        {trls("Price")}  
                                    </Form.Label>
                                    <Col sm="9" className="product-text">
                                        <Form.Control type="text" name="price" required placeholder="Price" />
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">
                                        {trls("Start_date")} 
                                    </Form.Label>
                                    <Col sm="9" className="product-text">
                                        {!this.state.startdate ? (
                                            <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date()} onChange={date =>this.setState({startdate:date})} />
                                        ) : <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(this.state.startdate)} onChange={date =>this.setState({startdate:date})} />
                                        } 
                                    </Col>
                                </Form.Group>
                                <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">
                                        {trls("End_date")} 
                                    </Form.Label>
                                    <Col sm="9" className="product-text">
                                        {!this.state.enddate ? (
                                            <DatePicker name="enddate"  className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date()} onChange={date =>this.setState({enddate:date})} />
                                        ) : <DatePicker name="enddate"  className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date(this.state.enddate)} onChange={date =>this.setState({enddate:date})} />
                                        }
                                    </Col>
                                </Form.Group>
                                <Form.Group style={{textAlign:"center"}}>
                                    <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                                </Form.Group>
                            </Form>
                    </Modal.Body>
                </Modal>
              );
          }else if(this.props.price_flag===2){
            return (
                <Modal
                    show={this.props.show}
                    onHide={this.onHide}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                  <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {trls("Sales_Price")}
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                      <Form className="container product-form" onSubmit = { this.handleSubmit }>
                          <Form.Group as={Row} controlId="formPlaintextPassword">
                              <Form.Label column sm="3">
                                  {trls("Price")}  
                              </Form.Label>
                              <Col sm="9" className="product-text">
                                  <Form.Control type="text" name="price" required placeholder="Price" />
                              </Col>
                          </Form.Group>
                          <Form.Group as={Row} controlId="formPlaintextPassword">
                              <Form.Label column sm="3">
                                  {trls("Start_date")}  
                              </Form.Label>
                              <Col sm="9" className="product-text">
                                  {!this.state.startdate ? (
                                     <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date()} onChange={date =>this.setState({startdate:date})} />
                                  ) : <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.startdate} onChange={date =>this.setState({startdate:date})} />
                                  } 
                              </Col>
                          </Form.Group>
                          <Form.Group as={Row} controlId="formPlaintextPassword">
                              <Form.Label column sm="3">
                                  {trls("End_date")}  
                              </Form.Label>
                              <Col sm="9" className="product-text">
                                  {!this.state.enddate ? (
                                     <DatePicker name="enddate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date()} onChange={date =>this.setState({enddate:date})} />
                                  ) : <DatePicker name="enddate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.enddate} onChange={date =>this.setState({enddate:date})} />
                                  }
                              </Col>
                          </Form.Group>
                          <Form.Group style={{textAlign:"center"}}>
                              <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                          </Form.Group>
                      </Form>
                  </Modal.Body>
                </Modal>
              );
          }
          else{
            const transportlist = this.state.transportlist.map( s => ({value:s.Key,label:s.Value}));
            const pricingtypelist = [
                { value: '1', label: 'Blokvracht' },
                { value: '2', label: 'Eenheidsprijs' },
              ];
            return (
                <Modal
                    show={this.props.show}
                    onHide={this.onHide}
                    size="lg"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="contained-modal-title-vcenter">
                            {trls('Transport_Price')}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form className="container product-form" onSubmit = { this.handleSubmit }>
                                <ListErrors errors={this.props.error} />
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                    <Form.Label column sm="3">
                                        {trls('Transporter')}  
                                    </Form.Label>
                                    <Col sm="9" className="product-text">
                                        <Select
                                            name="transport"
                                            options={transportlist}
                                            onChange={val => this.setState({transprot_key:val})}
                                        />
                                        {!this.props.disabled && (
                                            <input
                                                onChange={val=>console.log()}
                                                tabIndex={-1}
                                                autoComplete="off"
                                                style={{ opacity: 0, height: 0 }}
                                                value={this.state.transprot_key}
                                                required
                                                />
                                        )}
                                    </Col>
                            </Form.Group>
                            {this.state.transprot_key.value!=="99999999" ? (
                                    <Form.Group as={Row} controlId="formPlaintextPassword">
                                            <Form.Label column sm="3">
                                                {trls('Pricingtype')}  
                                            </Form.Label>
                                            <Col sm="9" className="product-text">
                                                <Select
                                                    name="pricingtype"
                                                    options={pricingtypelist}
                                                    onChange={val => this.setState({pricetype:val})}
                                                />
                                                {!this.props.disabled && (
                                                    <input
                                                        onChange={val=>console.log()}
                                                        tabIndex={-1}
                                                        autoComplete="off"
                                                        style={{ opacity: 0, height: 0 }}
                                                        value={this.state.pricetype}
                                                        required
                                                        />
                                                )}
                                            </Col>
                                    </Form.Group>
                                ) : null
                                }
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="3">
                                    {trls('Price')}  
                                </Form.Label>
                                <Col sm="9" className="product-text">
                                    <Form.Control type="text" name="price" required placeholder="Price" />
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="3">
                                    {trls('Start_date')}  
                                </Form.Label>
                                <Col sm="9" className="product-text">
                                    {!this.state.startdate ? (
                                        <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date()} onChange={date =>this.setState({startdate:date})} />
                                    ) : <DatePicker name="startdate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.startdate} onChange={date =>this.setState({startdate:date})} />
                                    } 
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row} controlId="formPlaintextPassword">
                                <Form.Label column sm="3">
                                    {trls('End_date')}  
                                </Form.Label>
                                <Col sm="9" className="product-text">
                                    {!this.state.enddate ? (
                                        <DatePicker name="enddate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={new Date()} onChange={date =>this.setState({enddate:date})} />
                                    ) : <DatePicker name="enddate" className="myDatePicker" dateFormat="dd-MM-yyyy" selected={this.state.enddate} onChange={date =>this.setState({enddate:date})} />
                                    }
                                </Col>
                            </Form.Group>
                            <Form.Group style={{textAlign:"center"}}>
                                <Button type="submit" style={{width:"100px"}}>{trls('Save')}</Button>
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                </Modal>
              );
          }
          
      }
    }
    export default connect(mapStateToProps, mapDispatchToProps)(Productform);