import logo from "../assets/logo.png";

function Navbar() {
  return (
    <div style={{
      background: "#0b3d6d",
      padding: "10px 20px",
      display: "flex",
      alignItems: "center",
      color: "white"
    }}>
      <img src={logo} alt="logo" style={{ height: "50px", marginRight: "15px" }} />

      <div>
        <h5 style={{ margin: 0 }}>Indian Institute of Technology</h5>
        <h4 style={{ margin: 0 }}>Bhubaneswar</h4>
      </div>
    </div>
  );
}

export default Navbar;