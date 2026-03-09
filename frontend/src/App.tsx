import { useState, useRef } from "react";
import { useSocket } from "./useSocket";

export default function App() {
  const { connected, state, notification, myMessage, remoteAnimating, press } = useSocket();
  const [pressing, setPressing] = useState(false);
  const [ripples, setRipples] = useState<number[]>([]);
  const [localAnimating, setLocalAnimating] = useState(false);
  const rippleId = useRef(0);

  function addRipple() {
    const id = rippleId.current++;
    setRipples(r => [...r, id]);
    setTimeout(() => setRipples(r => r.filter(x => x !== id)), 1200);
  }

  function handlePress() {
    if (pressing || !connected) return;
    setPressing(true);
    setLocalAnimating(true);
    addRipple();
    press();
    setTimeout(() => setLocalAnimating(false), 800);
    setTimeout(() => setPressing(false), 600);
  }

  const isAnimating = localAnimating || remoteAnimating;

  function formatTime(ts: number | null) {
    if (!ts) return null;
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e2de9fff 0%, #e2de9fff 25%, #e2de9fff 50%, #e2de9fff 75%, #e2de9fff 100%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Pastel blobs */}
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(ellipse at 20% 20%, rgba(52,81,245,0.45) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, rgba(52,81,245,0.4) 0%, transparent 50%),
          radial-gradient(ellipse at 60% 10%, rgba(52,81,245,0.5) 0%, transparent 40%)
        `,
        pointerEvents: "none",
      }} />

      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        width: isAnimating ? 900 : 600,
        height: isAnimating ? 900 : 600,
        borderRadius: "50%",
        background: isAnimating
          ? "radial-gradient(circle, rgba(226,222,159,0.15) 0%, transparent 70%)"
          : "radial-gradient(circle, rgba(226,222,159,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        transition: "all 0.3s ease",
      }} />

      {/* Connection status */}
      <div style={{
        position: "fixed", top: 20, left: 20,
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 11, color: connected ? "rgba(150,60,80,0.6)" : "rgba(200,100,100,0.5)",
        letterSpacing: "0.1em", zIndex: 10,
      }}>
        <span style={{
          width: 7, height: 7, borderRadius: "50%",
          background: connected ? "#c0392b" : "#ccc",
          display: "inline-block",
          animation: connected ? "pulse-dot 2s infinite" : "none",
        }} />
        {connected ? "CONECTADO" : "CONECTANDO..."}
      </div>

      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 56, zIndex: 10 }}>
        <div style={{
          fontSize: 11, letterSpacing: "0.35em",
          color: "rgba(200,60,80,0.6)", marginBottom: 12, textTransform: "uppercase",
        }}>
          CONECTADO DE MANERA GLOBAL
        </div>
        <h1 style={{
          fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 700,
          color: "#b03050", margin: 0, letterSpacing: "-0.02em", lineHeight: 1,
        }}>
          PULSO
        </h1>
        <div style={{
          marginTop: 10, fontSize: 13,
          color: "rgba(160,60,80,0.55)", letterSpacing: "0.1em",
        }}>
          conectando al mundo en tiempo real
        </div>
      </div>

      {/* Button */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {ripples.map(id => (
          <div key={id} style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: 160, height: 160, borderRadius: "50%",
            border: "2px solid rgba(220,50,70,0.5)",
            animation: "ripple 1.2s ease-out forwards",
            pointerEvents: "none",
          }} />
        ))}

        <button
          onClick={handlePress}
          disabled={pressing || !connected}
          style={{
            width: 160, height: 160, borderRadius: "50%", border: "none",
            background: pressing
              ? "radial-gradient(circle at 38% 32%, #ff6b6b, #c0392b)"
              : "radial-gradient(circle at 38% 32%, #ff4d4d, #d63031)",
            cursor: (!connected || pressing) ? "default" : "pointer",
            position: "relative",
            boxShadow: pressing
              ? "0 0 50px rgba(220,50,60,0.6), 0 0 100px rgba(220,50,60,0.25), inset 0 -6px 0 rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,180,180,0.4)"
              : "0 0 20px rgba(220,50,60,0.2), 0 8px 0 #a93226, 0 12px 20px rgba(180,40,50,0.3), inset 0 2px 4px rgba(255,180,180,0.3)",
            transform: pressing ? "scale(0.94) translateY(6px)" : "scale(1) translateY(0px)",
            transition: "all 0.12s cubic-bezier(0.34, 1.56, 0.64, 1)",
            outline: "none",
            opacity: connected ? 1 : 0.5,
          }}
        >
          <div style={{
            position: "absolute", top: 18, left: 28,
            width: 60, height: 30, borderRadius: "50%",
            background: "rgba(255,255,255,0.25)", filter: "blur(4px)",
            transform: "rotate(-20deg)", pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", inset: 14, borderRadius: "50%",
            border: "1.5px solid rgba(255,255,255,0.15)",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: pressing ? 28 : 18, height: pressing ? 28 : 18,
            borderRadius: "50%",
            background: pressing ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
            transition: "all 0.2s ease",
            boxShadow: pressing ? "0 0 20px rgba(255,255,255,0.9)" : "0 0 10px rgba(255,255,255,0.5)",
          }} />
        </button>
      </div>

      {/* Counter */}
      <div style={{ marginTop: 48, textAlign: "center", zIndex: 10 }}>
        <div style={{
          fontSize: 48, fontWeight: 700, color: "#c0392b", lineHeight: 1,
          fontVariantNumeric: "tabular-nums", textShadow: "0 2px 8px rgba(200,50,60,0.2)",
        }}>
          {state.count.toLocaleString()}
        </div>
        <div style={{
          fontSize: 11, color: "rgba(160,60,80,0.5)",
          letterSpacing: "0.3em", textTransform: "uppercase", marginTop: 6,
        }}>
          pulsaciones totales
        </div>
        {state.lastPressed && (
          <div style={{ fontSize: 11, color: "rgba(200,60,80,0.5)", marginTop: 8, letterSpacing: "0.1em" }}>
            última: {formatTime(state.lastPressed)}
          </div>
        )}
      </div>

      {/* My message */}
      {myMessage && !notification && (
        <div style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.7)", border: "1px solid rgba(220,80,100,0.3)",
          borderRadius: 26, padding: "14px 28px", color: "#c0392b",
          fontSize: 24, letterSpacing: "0.04em", zIndex: 100,
          backdropFilter: "blur(12px)", textAlign: "center", maxWidth: "80vw",
          animation: "fadeInUp 0.3s ease", boxShadow: "0 4px 20px rgba(200,60,80,0.15)",
        }}>
          {myMessage}
        </div>
      )}

      {/* Incoming notification */}
      {notification && (
        <div style={{
          position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,0.75)", border: "1px solid rgba(220,80,100,0.25)",
          borderRadius: 16, padding: "14px 28px", color: "#8b2635",
          fontSize: 14, letterSpacing: "0.04em", zIndex: 100,
          backdropFilter: "blur(12px)", textAlign: "center", maxWidth: "80vw",
          animation: "fadeInUp 0.3s ease", display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 4px 20px rgba(200,60,80,0.15)",
        }}>
          <span style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "#e74c3c", boxShadow: "0 0 8px rgba(231,76,60,0.7)",
            flexShrink: 0, animation: "blink 1s infinite", display: "inline-block",
          }} />
          {notification}
        </div>
      )}

      {/* Instructions */}
      <div style={{
        position: "fixed", top: 24, right: 24, fontSize: 11,
        color: "rgba(160,60,80,0.35)", letterSpacing: "0.1em",
        textAlign: "right", lineHeight: 1.8, zIndex: 10,
      }}>
        <div>COMPARTE ESTA URL</div>
        <div>CON ALGUIEN EN EL MUNDO</div>
      </div>
    </div>
  );
}
