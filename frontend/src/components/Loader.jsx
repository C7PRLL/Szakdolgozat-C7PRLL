import './Loader.css';
import wheel from '../assets/f1-wheel.png';

function Loader() {
  return (
    <div className="loader-overlay">
      <div className="loader-content">
        <div className="smoke-container">
  <img src={wheel} alt="F1 Wheel" className="wheel-img" />

  <div className="smoke smoke1"></div>
  <div className="smoke smoke2"></div>
  <div className="smoke smoke3"></div>
</div>
        <p>Betöltés...</p>
      </div>
    </div>
  );
}

export default Loader;