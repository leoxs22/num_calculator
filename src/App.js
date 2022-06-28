import "./App.css"
import "bootstrap/dist/css/bootstrap.min.css"
import {
    Card,
    Col,
    Container,
    FormControl,
    InputGroup,
    ListGroup,
    Row,
    Table,
} from "react-bootstrap"
import {useEffect, useState} from "react"
import CardHeader from "react-bootstrap/CardHeader"
import {blocksPerYear, colateralRatio, interests} from "./constants"
import {FaTwitter, FaLinkedinIn, FaGithub, FaChevronDown} from "react-icons/fa"
import {MdEdit} from "react-icons/md"
import numLogo from "./images/numlogo.png"
import {formatNumber} from "./NumberFormatter"
import Spinner from "./Spinner";
import {ImCross} from "react-icons/im";

const axios = require("axios").default

function App() {
    const [nuArsPricePancake, setNuArsPricePancake] = useState(null)
    const [customBuenbitAPY, setCustomBuenbitAPY] = useState(7)
    const [tna, setTNA] = useState(58);
    const [selectedDays, setSelectedDays] = useState(90)
    const [requestedAmount, setRequestedAmount] = useState(100000)
    const [editDolarPrice, setEditDolarPrice] = useState(false)
    const [manualDolarPrice, setManualDolarPrice] = useState(false)
    const [predictedDolar, setPredictedDolar] = useState(null)
    const [openSimulator, setOpenSimulator] = useState(true)

    const interest = requestedAmount * (tna / 100 / 365 + 1) ** selectedDays - requestedAmount;
    const tea = (tna / 100 / 365 + 1) ** 365;
    const nuArsPrice = editDolarPrice ? 1 / manualDolarPrice : nuArsPricePancake

    useEffect(() => {
        axios
            .get(
                "https://api.pancakeswap.info/api/v2/tokens/0x91bc956F064d755dB2e4EfE839eF0131e0b07E28"
            )
            .then((res) => {
                setNuArsPricePancake(parseFloat(res.data.data.price))
                setManualDolarPrice((1 / parseFloat(res.data.data.price)).toFixed(2))
                setPredictedDolar(((1 / parseFloat(res.data.data.price)) * 1.3).toFixed(2))
            })
            .catch((err) => {
                console.log(err)
            })

    }, [])

    const dolarizedAmount = requestedAmount * nuArsPrice
    const colateralNeeded = dolarizedAmount * colateralRatio
    const buenbitInterestInDays = (1 + customBuenbitAPY/100) ** (selectedDays / 365)
    const expectedBuenbitEarnings = colateralNeeded * (buenbitInterestInDays - 1)
    const expectedBuenbitEarningsWithoutColateral =
        dolarizedAmount * (buenbitInterestInDays - 1)
    const totalDollars =
        dolarizedAmount + expectedBuenbitEarningsWithoutColateral
    const dolarPriceNeededToCoverInterest = (requestedAmount + interest) / totalDollars;
    const predictedEarnings = (totalDollars * predictedDolar) - (requestedAmount + interest);

    const requiredDolarIncrease = dolarPriceNeededToCoverInterest * nuArsPrice - 1
    return (
        <div className={"outside"}>
            <Container className={"app"}>
                <div>
                    <Card>
                        <CardHeader>
                            <Row>
                                <Col>
                                    <img src={numLogo} className={"logo"}/>
                                </Col>
                                <Col className={"col-auto"}>
                                    <h2 className={"m-0"}>Calculadora Num Buenbit</h2>
                                    <h5 className={"p-0 text-muted"}>(no oficial)</h5>
                                </Col>
                            </Row>
                        </CardHeader>
                    </Card>
                    <Card>
                        <ListGroup>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Precio dólar</Col>
                                    <Col className="col-auto"> {
                                        !editDolarPrice ?
                                            <>
                                                {(nuArsPricePancake
                                                    ?
                                                    (<span
                                                        className={"mx-2"}> $ {formatNumber(1 / nuArsPricePancake)}</span>)
                                                    :
                                                    <Spinner/>)}
                                                <MdEdit className={"text-muted"} style={{marginTop: "-0.2rem"}}
                                                        onClick={() => setEditDolarPrice(true)}/>
                                            </>
                                            :
                                            <Row>
                                                <Col className={"p-0"}>
                                                    <FormControl
                                                        aria-label="manual_dolar"
                                                        aria-describedby="manual_dolar"
                                                        style={{
                                                            width: "5rem",
                                                            height: "1.6rem",
                                                            textAlign: "right",
                                                            fontWeight: "bold"
                                                        }}
                                                        value={manualDolarPrice}
                                                        onChange={(e) => setManualDolarPrice(e.target.value.replaceAll(',', '.') || 0)}
                                                    />
                                                </Col>
                                                <Col className={"col-auto"}>
                                                    <ImCross style={{color: "red", float: "right", marginTop: "0.3rem"}}
                                                             onClick={() => setEditDolarPrice(false)}/>
                                                </Col>
                                            </Row>
                                    }
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Buenbit DAI APY</Col>
                                    <Col className="col-auto">
                                        <InputGroup size="sm" style={{maxWidth: "8em"}}>
                                            <FormControl
                                                aria-label="manual_apy"
                                                aria-describedby="manual_apy"
                                                value={customBuenbitAPY}
                                                onChange={(e) => setCustomBuenbitAPY(e.target.value.replaceAll(',', '.') || 0)}
                                            />
                                            <InputGroup.Text id="manual_apy">
                                                %
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>TNA préstamo</Col>
                                    <Col className="col-auto">
                                        <InputGroup size="sm" style={{maxWidth: "8em"}}>
                                            <FormControl
                                                aria-label="manual_apy"
                                                aria-describedby="manual_apy"
                                                value={tna}
                                                onChange={(e) => setTNA(e.target.value.replaceAll(',', '.') || 0)}
                                            />
                                            <InputGroup.Text id="manual_apy">
                                                %
                                            </InputGroup.Text>
                                        </InputGroup>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Ratio colateral</Col>
                                    <Col className="col-auto">
                                        {formatNumber(colateralRatio * 100)}%
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                    <Card className="p-3">
                        <InputGroup className={"mb-3"}>
                            <InputGroup.Text id="requested_days">
                                Dias de préstamo
                            </InputGroup.Text>
                            <FormControl
                                aria-label="requested_days"
                                aria-describedby="requested_days"
                                value={selectedDays}
                                onChange={(e) => setSelectedDays(e.target.value)}
                            />
                        </InputGroup>
                        <InputGroup>
                            <InputGroup.Text id="requested_amount">
                                Monto solicitado $
                            </InputGroup.Text>
                            <FormControl
                                aria-label="requested_amount"
                                aria-describedby="requested_amount"
                                value={requestedAmount}
                                onChange={(e) => setRequestedAmount(e.target.value)}
                            />
                        </InputGroup>
                    </Card>
                    <Card>
                        <ListGroup>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Total a recibir</Col>
                                    <Col className="col-auto">
                                        ${formatNumber(requestedAmount)}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Tasa Efectiva</Col>
                                    <Col className="col-auto">{formatNumber(interest/requestedAmount*100)}%</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Tasa Efectiva Anual</Col>
                                    <Col className="col-auto">{formatNumber(tea * 100 - 100)}%</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Total intereses</Col>
                                    <Col className="col-auto">${formatNumber(interest)}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Colateral necesario</Col>
                                    <Col className="col-auto">
                                        U$D {formatNumber(colateralNeeded)}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Ganancia en Buenbit</Col>
                                    <Col className="col-auto">
                                        U$D {formatNumber(expectedBuenbitEarnings)}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>
                                        Ganancia en Buenbit{' '}
                                        <span className={"text-muted"}>sin colateral extra</span>
                                    </Col>
                                    <Col className="col-auto">
                                        U$D {formatNumber(expectedBuenbitEarningsWithoutColateral)}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Precio del dólar al que se paga solo</Col>
                                    <Col className="col-auto">
                                        $ {formatNumber(dolarPriceNeededToCoverInterest)}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Aumento del dólar necesario</Col>
                                    <Col className="col-auto">
                                        <p className={"mb-0"}>
                                            <div className={"float-right"}>
                                                <span className={"text-muted"}>mensual </span>
                                                {formatNumber(
                                                    ((requiredDolarIncrease + 1) ** (30 / selectedDays) -
                                                        1) *
                                                    100
                                                )}
                                                %
                                            </div>
                                        </p>
                                        <p className={"mb-0"}>
                                            <div className={" float-right"}>
                        <span className={"text-muted"}>
                            en {selectedDays} días{' '}
                        </span>
                                                {formatNumber(requiredDolarIncrease * 100)}%
                                            </div>
                                        </p>
                                        <p className={"mb-0"}>
                                            <div className={"float-right"}>
                                                <span className={"text-muted"}>anual </span>
                                                {formatNumber(
                                                    ((requiredDolarIncrease + 1) ** (365 / selectedDays) -
                                                        1) *
                                                    100
                                                )}
                                                %
                                            </div>
                                        </p>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                        </ListGroup>
                    </Card>
                    <Card>
                        <CardHeader>
                            <h3 onClick={(event => setOpenSimulator((prev) => !prev))}>
                                Simulador de ganancia
                                <FaChevronDown className={"float-right"} style={{marginTop: "0.4rem"}}/>
                            </h3>
                        </CardHeader>
                        <div hidden={openSimulator}>
                            <Row className={"m-2"}>
                                <Col>
                                    <InputGroup>
                                        <InputGroup.Text id="predicted_amount">
                                            Si el dolar se va a $
                                        </InputGroup.Text>
                                        <FormControl
                                            aria-label="predicted_amount"
                                            aria-describedby="predicted_amount"
                                            value={predictedDolar}
                                            onChange={(e) => setPredictedDolar(e.target.value.replaceAll(',', '.') || 0)}
                                        />
                                    </InputGroup>
                                </Col>
                            </Row>
                            <div className={"m-2 mx-4"}>
                                <Row>
                                    <Col>
                                        Aumento dólar anualizado
                                    </Col>
                                    <Col className={"col-auto"}>
                                        {formatNumber(((predictedDolar * nuArsPrice) ** (365 / selectedDays) - 1) * 100)}%
                                    </Col>
                                </Row>
                                <Row className={"mt-2 font-weight-bold"}>
                                    <Col>
                                        {predictedEarnings >= 0 ? "Ganamos" : "Perdemos"}
                                    </Col>
                                    <Col>
                                            <span style={{color: predictedEarnings >= 0 ? "green" : "red"}}>
                                                <Row>
                                                    <Col>
                                                        <span
                                                            className="float-right">{formatNumber(Math.abs(predictedEarnings))} nuARS </span>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                    <Col>
                                                        <span
                                                            className="float-right">{formatNumber(Math.abs(predictedEarnings / predictedDolar))} U$D</span>
                                                    </Col>
                                                </Row>
                                            </span>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className={"text-center p-1"}>
                            Hecho con ♥ por leoxs. Seguime!
                            <a
                                href={"http://twitter.narosky.com"}
                                target="_blank"
                                className={"px-1"}
                            >
                                <FaTwitter/>
                            </a>
                            <a
                                href={"http://linkedin.narosky.com"}
                                target="_blank"
                                className={"px-1"}
                            >
                                <FaLinkedinIn/>
                            </a>
                            <a
                                href={"http://github.narosky.com"}
                                target="_blank"
                                className={"px-1"}
                            >
                                <FaGithub/>
                            </a>
                        </div>
                    </Card>
                    <Card className={"p-2"}>
                        <div className={"text-muted"}>
                            Puede haber errores en los cálculos, do your own research
                        </div>
                    </Card>
                </div>
            </Container>
        </div>
    )
}

export default App
