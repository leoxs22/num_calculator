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
import NumberFormat from "react-number-format"
import {FaTwitter, FaLinkedinIn, FaGithub} from "react-icons/fa"
import {MdEdit} from "react-icons/md"
import numLogo from "./images/numlogo.png"
import {formatNumber} from "./NumberFormatter"

const axios = require("axios").default

function App() {
    const [nuArsPrice, setNuArsPrice] = useState(null)
    const [currentAnchorAPY, setCurrentAnchorAPY] = useState(null)
    const [customAnchorAPY, setCustomAnchorAPY] = useState(null)
    const [selectedDays, setSelectedDays] = useState(90)
    const [requestedAmount, setRequestedAmount] = useState(500000)
    const [lastUpdated, setLastUpdated] = useState({anchor: null, num: null})
    const [editAnchorApy, setEditAnchorAPY] = useState(false)

    const selectedInterest = interests.find((i) => i.days === selectedDays)
    const interest =
        ((requestedAmount * selectedInterest.discount) / 360) * selectedDays
    const amountToReceive = requestedAmount - interest

    useEffect(() => {
        axios
            .get(
                "https://api.pancakeswap.info/api/v2/tokens/0x91bc956F064d755dB2e4EfE839eF0131e0b07E28"
            )
            .then((res) => {
                setNuArsPrice(parseFloat(res.data.data.price))
                setLastUpdated((prev) => ({...prev, num: new Date()}))
            })
            .catch((err) => {
                console.log(err)
            })

        // get APY anchor earn
        axios
            .get("https://api.anchorprotocol.com/api/v2/deposit-rate")
            .then((res) => {
                setCurrentAnchorAPY(
                    parseFloat(res.data[0].deposit_rate) * blocksPerYear
                )
                setLastUpdated((prev) => ({...prev, anchor: new Date()}))
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])

    const anchorAPY = customAnchorAPY && editAnchorApy ? customAnchorAPY / 100 : currentAnchorAPY
    const classColor =
        customAnchorAPY / 100 < currentAnchorAPY ? "text-danger" : "text-success"

    const dolarizedAmount = requestedAmount * nuArsPrice
    const receivedDollarizedAmount = amountToReceive * nuArsPrice
    const colateralNeeded = dolarizedAmount * colateralRatio
    const anchorInterestInDays = (1 + anchorAPY) ** (selectedDays / 365)
    const expectedAnchorEarnings = colateralNeeded * (anchorInterestInDays - 1)
    const expectedAnchorEarningsWithoutColateral =
        receivedDollarizedAmount * (anchorInterestInDays - 1)
    const totalDollars =
        receivedDollarizedAmount + expectedAnchorEarningsWithoutColateral
    const dolarPriceNeededToCoverInterest = requestedAmount / totalDollars

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
                                    <h2 className={"m-0"}>Calculadora Num Finance</h2>
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
                                    <Col className="col-auto">
                                        ${formatNumber(1 / nuArsPrice)}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Anchor APY</Col>
                                    <Col className="col-auto">
                                        <span className={"mx-2"}>{formatNumber(currentAnchorAPY * 100)}%</span>
                                        <MdEdit className={"text-muted"}
                                                onClick={() => setEditAnchorAPY(prev => !prev)}/>
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item hidden={!editAnchorApy}>
                                <Row>
                                    <InputGroup>
                                        <InputGroup.Text id="requested_amount">
                                            Anchor APY manual %
                                        </InputGroup.Text>
                                        <FormControl
                                            className={classColor}
                                            aria-label="requested_amount"
                                            aria-describedby="requested_amount"
                                            value={customAnchorAPY}
                                            onChange={(e) => setCustomAnchorAPY(e.target.value)}
                                        />
                                    </InputGroup>
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
                        <select
                            className="form-select mb-3"
                            aria-label="Default select"
                            onChange={(e) => setSelectedDays(Number(e.target.value))}
                        >
                            {interests.map((interest) => (
                                <option
                                    value={interest.days}
                                    selected={interest.days === selectedDays}
                                >
                                    {interest.days} días - Tasa de descuento {interest.discount * 100}%
                                </option>
                            ))}
                        </select>
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
                                        ${formatNumber(amountToReceive)}
                                    </Col>
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
                                    <Col>Ganancia en Anchor</Col>
                                    <Col className="col-auto">
                                        U$D {formatNumber(expectedAnchorEarnings)}
                                    </Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>
                                        Ganancia en Anchor{' '}
                                        <span className={"text-muted"}>sin colateral extra</span>
                                    </Col>
                                    <Col className="col-auto">
                                        U$D {formatNumber(expectedAnchorEarningsWithoutColateral)}
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
                            Intereses de num actualizados al 22/04/2022
                        </div>
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
