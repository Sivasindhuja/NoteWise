import React from "react";
const year=new Date().getFullYear();
console.log(year)
function Footer(){
    return (
        <p>Copyright {year}</p>
    )
}
export default Footer;