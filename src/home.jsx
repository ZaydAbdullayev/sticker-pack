// GÜNCELLENMİŞ: SCALE=1 MERKEZ KORUNARAK YAPILDI & TIKLAMA İLE STICKER EKLEME
import { useEffect, useRef, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import "./home.scss";
import { RiTwitterXFill } from "react-icons/ri";

const shapes = ["square", "rectangle", "circle", "rhombus"];
const bgColors = ["#FFD700", "#FF6347", "#87CEEB", "#FFFFFF"];
const textColors = ["#ffffff", "#000000", "#FF00FF", "#333333"];
const sizes = {
  small: 60,
  middle: 100,
  big: 140,
};

export const App = () => {
  const stickerPack = JSON.parse(localStorage.getItem("stickerPack")) || [];
  const [stickers, setStickers] = useState(stickerPack);
  const [userStickers, setUserStickers] = useState([]);
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    shape: "square",
    bgColor: "#FFD700",
    textColor: "#ffffff",
    size: "middle",
    message: "",
  });
  const [placingMode, setPlacingMode] = useState(false);
  const [ghostPos, setGhostPos] = useState({ x: 1400, y: 1000 });
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(null);
  const [panning, setPanning] = useState(true);
  const transformRef = useRef(null);

  useEffect(() => {
    if (wrapperRef.current) {
      const wrapperWidth = wrapperRef.current.offsetWidth;
      const scaleFactor = wrapperWidth / 3000;
      setScale(scaleFactor);
    }
    const stored = sessionStorage.getItem("stickers");
    if (stored) {
      setUserStickers(JSON.parse(stored));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isOverlapping = (x, y, size) => {
    return stickers.some((s) => {
      const sSize = sizes[s.size];
      return (
        x < s.x + sSize && x + size > s.x && y < s.y + sSize && y + size > s.y
      );
    });
  };

  const handleWallClick = (e) => {
    if (!placingMode || !selectedSticker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const size = sizes[selectedSticker.size];
    if (isOverlapping(x, y, size)) {
      alert("⚠️ Sticker is overlapping with another sticker!");
      return;
    }

    const newSticker = {
      ...selectedSticker,
      id: Date.now(),
      x,
      y,
    };
    const updated = [...stickers, newSticker];
    setStickers(updated);
    setPlacingMode(false);
    setSelectedSticker(null);
    setForm({
      shape: "square",
      bgColor: "#FFD700",
      textColor: "#ffffff",
      size: "middle",
      message: "",
    });
    localStorage.setItem("stickerPack", JSON.stringify(updated));
  };

  const handleStartPlacing = (sticker) => {
    if (transformRef.current && wrapperRef.current) {
      const {
        positionX,
        positionY,
        scale: currentScale,
      } = transformRef.current.state;
      const rect = wrapperRef.current.getBoundingClientRect();

      const centerX = -positionX + rect.width / 2;
      const centerY = -positionY + rect.height / 2;

      const newX = -(centerX * (1 / currentScale)) + rect.width / 2;
      const newY = -(centerY * (1 / currentScale)) + rect.height / 2;

      transformRef.current.setTransform(newX, newY, 1);
    }

    setGhostPos({ x: 1400, y: 1000 });
    setSelectedSticker(sticker);
    setPlacingMode(true);
  };

  const handleMouseMove = (e) => {
    if (!placingMode || !selectedSticker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const size = sizes[selectedSticker.size];
    setGhostPos({ x: x + size / 2, y: y + size / 2 });
  };

  const saveStickerToSession = () => {
    const newList = [...userStickers, form];
    setUserStickers(newList);
    sessionStorage.setItem("stickers", JSON.stringify(newList));
    setShowModal(false);
    setForm({
      shape: "square",
      bgColor: "#FFD700",
      textColor: "#ffffff",
      size: "middle",
      message: "",
    });
    setSelectedSticker(null);
    setPlacingMode(false);
  };

  return (
    <div className="sticker-container">
      <a
        href="https://x.com/solonwall"
        target="_blank"
        rel="noopener noreferrer"
        className="contact-link"
      >
        <RiTwitterXFill />
      </a>
      <div className="header">
        <h1 className="title">Wall of Sol </h1>
        <p className="description">
          Create your own stickers and place them on the wall. Double-click to
          place a sticker.
          <br />
          <strong>Note:</strong> Stickers cannot overlap with each other.
        </p>
      </div>

      <div className="stickers">
        {userStickers.length > 0 && (
          <div className="sticker-list">
            {userStickers.map((s, i) => (
              <div
                key={i}
                onClick={() => handleStartPlacing(s)}
                className={`sticker-preview ${s.shape} ${selectedSticker === s ? "active" : ""
                  }`}
                style={{
                  backgroundColor: s.bgColor,
                  color: s.textColor,
                  width: `${sizes[s.size]}px`,
                  height: `${sizes[s.size]}px`,
                }}
              >
                {s.shape === "rhombus" ? (
                  <span>{s.message || "Sticker"}</span>
                ) : (
                  s.message || "Sticker"
                )}
              </div>
            ))}
          </div>
        )}

        <button onClick={() => setShowModal(true)} className="submit-button">
          Create Sticker
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Sticker</h2>
            <div className="form-grid">
              <div className="option">
                <span>Shape:</span>
                <div className="box shapes">
                  {shapes.map((s) => (
                    <span
                      key={s}
                      className={`${s} ${form.shape === s ? "active" : ""}`}
                      onClick={() => setForm({ ...form, shape: s })}
                    ></span>
                  ))}
                </div>
              </div>
              <div className="option">
                <span>Background color:</span>
                <div className="box colors">
                  {bgColors.map((s) => (
                    <span
                      key={s}
                      style={{ background: s }}
                      className={`${form.bgColor === s ? "active" : ""}`}
                      onClick={() => setForm({ ...form, bgColor: s })}
                    ></span>
                  ))}
                  <label>
                    <span style={{ background: form.bgColor }}>+</span>
                    <input
                      type="color"
                      name="bgColor"
                      onChange={handleChange}
                      value={form.bgColor}
                      style={{ width: "30px", height: "30px" }}
                    />
                  </label>
                </div>
              </div>
              <div className="option">
                <span>Text color:</span>
                <div className="box colors">
                  {textColors.map((s) => (
                    <span
                      key={s}
                      style={{ background: s }}
                      className={`${form.textColor === s ? "active" : ""}`}
                      onClick={() => setForm({ ...form, textColor: s })}
                    ></span>
                  ))}
                  <label>
                    <span style={{ background: form.textColor }}>+</span>
                    <input
                      type="color"
                      name="textColor"
                      onChange={handleChange}
                      value={form.textColor}
                      style={{ width: "30px", height: "30px" }}
                    />
                  </label>
                </div>
              </div>

              <div className="option">
                <span>Sticker Size:</span>
                <select name="size" onChange={handleChange} value={form.size}>
                  {Object.keys(sizes).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="option">
                <span>Text:</span>
                <input
                  type="text"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="btns">
              <button onClick={saveStickerToSession} className="cancel-button">
                Cancel
              </button>
              <button onClick={saveStickerToSession} className="save-button">
                Save Sticker
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="wall-wrapper" ref={wrapperRef}>
        {scale !== null && (
          <TransformWrapper
            ref={transformRef}
            minScale={scale}
            initialScale={scale}
            limitToBounds={false}
            onInit={(utils) => (transformRef.current = utils)}
            initialPositionX={0}
            initialPositionY={0}
            doubleClick={{ disabled: true }}
            panning={{
              disabled: panning || placingMode,
            }}
            wheel={{ disabled: placingMode }}
            pinch={{ disabled: placingMode }}
            onZoom={({ state }, _) => {
              console.log("Zooming", state?.scale);
              if (state?.scale > scale) {
                setPanning(false);
              } else {
                setPanning(true);
                transformRef.current.setTransform(0, 0, scale);
              }
            }}
          >
            <TransformComponent>
              <div
                className="sticker-wall"
                onMouseMove={handleMouseMove}
                onClick={handleWallClick}
                style={{ width: 3000, height: 2000 }}
              >
                {stickers.map((s) => {
                  const width =
                    s.shape === "rectangle" ? sizes[s.size] * 2 : sizes[s.size];
                  return (
                    <div
                      key={s.id}
                      className={`sticker ${s.shape}`}
                      style={{
                        backgroundColor: s.bgColor,
                        color: s.textColor,
                        width: `${width}px`,
                        height: `${sizes[s.size]}px`,
                        left: s.x,
                        top: s.y,
                        position: "absolute",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        borderRadius: s.shape === "circle" ? "50%" : "8px",
                      }}
                    >
                      {s.shape === "rhombus" ? (
                        <span
                          style={{
                            transform: "rotate(-45deg)",
                            display: "inline-block",
                            width: "100%",
                            textAlign: "center",
                          }}
                        >
                          {s.message}
                        </span>
                      ) : (
                        s.message
                      )}
                    </div>
                  );
                })}

                {placingMode && selectedSticker && (
                  <div
                    className={`sticker ghost ${selectedSticker.shape}`}
                    style={{
                      backgroundColor:
                        selectedSticker.shape === "triangle"
                          ? "transparent"
                          : selectedSticker.bgColor,
                      color: selectedSticker.textColor,
                      width:
                        selectedSticker.shape === "rectangle"
                          ? `${sizes[selectedSticker.size] * 2}px`
                          : `${sizes[selectedSticker.size]}px`,
                      height: `${sizes[selectedSticker.size]}px`,
                      left: ghostPos.x,
                      top: ghostPos.y,
                      position: "absolute",
                      transform: "translate(-50%, -50%)",
                      pointerEvents: "none",
                      opacity: 0.5,
                      border: "2px dashed #fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {selectedSticker.shape === "rhombus" ? (
                      <span
                        style={{
                          transform: "rotate(-45deg)",
                          display: "inline-block",
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        {selectedSticker.message}
                      </span>
                    ) : (
                      selectedSticker.message
                    )}
                  </div>
                )}
              </div>
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>
    </div>
  );
};
