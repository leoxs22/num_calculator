import NumberFormat from "react-number-format";

export function formatNumber(num) {
    return <NumberFormat value={num} displayType={'text'} thousandSeparator={"."} decimalSeparator={","}
                         decimalScale={2} className={"numbers"}/>
}