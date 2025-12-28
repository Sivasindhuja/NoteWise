import React from "react";
const year=new Date().getFullYear();
function Footer(){
    return (
        <p>Copyright {year}</p>
    )
}
export default Footer;