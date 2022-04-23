import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Card, Container, FormControl, InputGroup, ListGroup, ListGroupItem, Table} from "react-bootstrap";
import {useEffect, useState} from "react";
import CardHeader from "react-bootstrap/CardHeader";
const axios = require('axios').default;

const blocksPerYear = 4656810 // From anchor repo

const interests = [{
    days: 90,
    discount: 0.35
},
{
    days: 180,
    discount: 0.39
},
{
    days: 270,
    discount: 0.42
},
{
    days: 360,
    discount: 0.43
}]

const colateralRatio = 1.2;

function App() {

    const [nuArsPrice, setNuArsPrice] = useState(null);
    const [anchorAPY, setAnchorAPY] = useState(null);
    const [selectedDays, setSelectedDays] = useState(90);
    const [requestedAmount, setRequestedAmount] = useState(500000);

    const selectedInterest = interests.find(i => i.days === selectedDays);
    const interest = requestedAmount * (selectedInterest.discount)/360*selectedDays;
    const amountToReceive = requestedAmount - interest;

    useEffect(() => {
        axios.get('https://api.pancakeswap.info/api/v2/tokens/0x91bc956F064d755dB2e4EfE839eF0131e0b07E28')
        .then(res => {
            console.log(res.data.data.price);
            setNuArsPrice(parseFloat(res.data.data.price));
        })
        .catch(err => {
            console.log(err);
        })

        // get APY anchor earn
        axios.get('https://api.anchorprotocol.com/api/v2/deposit-rate')
        .then(res => {
            console.log(res.data[0].deposit_rate);
            setAnchorAPY(parseFloat(res.data[0].deposit_rate) * blocksPerYear);
        })
    }, [])

    const dolarizedAmount = requestedAmount * nuArsPrice;
    const receivedDollarizedAmount = amountToReceive * nuArsPrice;
    const colateralNeeded = dolarizedAmount * colateralRatio;
    const anchorInterestInDays = (1 + anchorAPY) ** (selectedDays / 365);
    const expectedAnchorEarnings = colateralNeeded * (anchorInterestInDays - 1);
    const expectedAnchorEarningsWithoutColateral = receivedDollarizedAmount * (anchorInterestInDays - 1);
    const totalDollars = receivedDollarizedAmount + expectedAnchorEarningsWithoutColateral;
    const dolarPriceNeededToCoverInterest = requestedAmount / totalDollars;

    const requiredDolarIncrease = dolarPriceNeededToCoverInterest * nuArsPrice - 1;
    return (
    <div className="App">
        <Container>
            <Card>
                <CardHeader>
                    <h1>Intereses (Actualizado 22/04/2022)</h1>
                </CardHeader>
             <Table>
                <thead>
                    <tr>
                        <th>Días</th>
                        <th>Tasa de descuento</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        interests.map(interest => {
                            return <tr>
                                <td>{interest.days}</td>
                                <td>{interest.discount * 100}%</td>
                            </tr>
                        })
                    }
                </tbody>
             </Table>
            </Card>
            <Card>
                <ListGroup>
                    <ListGroup.Item>Precio dólar (pancake): ${(1/nuArsPrice).toFixed(2)}</ListGroup.Item>
                    <ListGroup.Item>Anchor APY: {(anchorAPY*100).toFixed(2)}%</ListGroup.Item>
                    <ListGroup.Item>Ratio colateral {colateralRatio*100}%</ListGroup.Item>
                </ListGroup>
            </Card>
            <Card>
                <select className="form-select" aria-label="Default select" onChange={(e) => setSelectedDays(Number(e.target.value))}>
                    {interests.map(interest =>
                        <option value={interest.days} selected={interest.days === selectedDays}>{interest.days} días</option>
                    )}
                </select>
                <InputGroup className="mb-3">
                    <InputGroup.Text id="requested_amount">Monto solicitado $</InputGroup.Text>
                    <FormControl
                        aria-label="requested_amount"
                        aria-describedby="requested_amount"
                        value={requestedAmount}
                        onChange={(e) => setRequestedAmount(e.target.value)}
                    />
                </InputGroup>
                <ListGroup>
                    <ListGroup.Item><b>Total a recibir:</b> ${amountToReceive.toFixed(2)}</ListGroup.Item>
                    <ListGroup.Item><b>Total intereses:</b> ${interest.toFixed(2)}</ListGroup.Item>
                    <ListGroup.Item><b>Colateral necesario</b> U$D {colateralNeeded.toFixed(2)} </ListGroup.Item>
                    <ListGroup.Item><b>Ganancia esperada en Anchor</b> U$D {expectedAnchorEarnings.toFixed(2)}</ListGroup.Item>
                    <ListGroup.Item><b>Ganancia esperada en Anchor (sin colateral extra)</b> U$D {expectedAnchorEarningsWithoutColateral.toFixed(2)}</ListGroup.Item>
                    <ListGroup.Item><b>Precio del dolar necesario para cubrir interés</b> $ {dolarPriceNeededToCoverInterest.toFixed(2)}</ListGroup.Item>
                    <ListGroup.Item><b>Aumento del dólar necesario</b> {(requiredDolarIncrease*100).toFixed(2)}% en {selectedDays} días / {((((requiredDolarIncrease+1)**(30/90))-1)*100).toFixed(2)}% mensual / {((((requiredDolarIncrease+1)**(365/90)-1)*100)).toFixed(2)}% anual</ListGroup.Item>
                </ListGroup>
            </Card>
        </Container>



    </div>
  );
}

export default App;
