import React, { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import * as THREE from 'three'

export default function App() {
  const [shape, setShape] = useState('circle')
  const [angle, setAngle] = useState(30) 
  const [objHeight, setObjHeight] = useState(0.01)
  const [showHelper, setShowHelper] = useState(true)

  const [lineLen, setLineLen] = useState(6)
  const [circleRad, setCircleRad] = useState(3)
  const [rectW, setRectW] = useState(6)
  const [rectH, setRectH] = useState(6) 
  const [objDepth, setObjDepth] = useState(4)

  const angleRad = (angle * Math.PI) / 180
  const cosValue = Math.cos(angleRad)
  const sinValue = Math.sin(angleRad)

  const is3D = ['cylinder', 'box', 'cone', 'pyramid'].includes(shape)

  // --- [추가] 특수각 무리수 표현 함수 ---
  const getCosText = (ang) => {
    if (ang === 0) return "1";
    if (ang === 30) return "√3/2";
    if (ang === 45) return "√2/2";
    if (ang === 60) return "1/2";
    if (ang === 90) return "0";
    return Math.cos((ang * Math.PI) / 180).toFixed(3);
  }

  const getFloorHeight = (currentAngle) => {
    const rad = (currentAngle * Math.PI) / 180;
    if (is3D) {
      if (shape === 'cylinder' || shape === 'cone') return circleRad * Math.sin(rad);
      if (shape === 'box' || shape === 'pyramid') return (objDepth / 2) * Math.sin(rad);
    }
    return 0.01;
  }

  const handleAngleChange = (newAngle) => {
    setAngle(newAngle);
    setObjHeight(getFloorHeight(newAngle));
  }

  const handleSnapToFloor = () => {
    setObjHeight(getFloorHeight(angle));
  }

  // --- [수정] 무리수 및 파이 포함 정밀 수식 로직 ---
  let originalLabel = '', exactResult = '', approxResult = '', formula = '', symbol = '';
  const cosText = getCosText(angle);
  
  if (!is3D) {
    if (shape === 'line') {
      symbol = 'l';
      originalLabel = `${lineLen}`;
      exactResult = `${lineLen} × ${cosText}`;
      approxResult = (lineLen * cosValue).toFixed(2);
      formula = `l' = l × cos(θ)`;
    } else if (shape === 'circle') {
      symbol = 'S';
      const rSq = Math.pow(circleRad, 2);
      originalLabel = `${rSq}π`;
      exactResult = `${rSq}π × ${cosText}`;
      approxResult = `${(rSq * cosValue).toFixed(2)}π`;
      formula = `S' = S × cos(θ)`;
    } else if (shape === 'rect') {
      symbol = 'S';
      const area = rectW * rectH;
      originalLabel = `${area}`;
      exactResult = `${area} × ${cosText}`;
      approxResult = (area * cosValue).toFixed(2);
      formula = `S' = S × cos(θ)`;
    } else if (shape === 'triangle') {
      symbol = 'S';
      const area = (rectW * rectH) / 2;
      originalLabel = `${area}`;
      exactResult = `${area} × ${cosText}`;
      approxResult = (area * cosValue).toFixed(2);
      formula = `S' = S × cos(θ)`;
    }
  }

  const triangleShape = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(-rectW / 2, 0); s.lineTo(rectW / 2, 0); s.lineTo(0, rectH);
    return s
  }, [rectW, rectH])

  const helperLen = shape === 'circle' ? circleRad * 2 : shape === 'line' ? lineLen : rectH;

  const getProjectionLines = () => {
    const lines = [];
    const addLine = (x, y, z) => { lines.push([[x, y, z], [x, 0.01, z]]); };
    if (shape === 'triangle' || shape === 'rect') {
      addLine(0, objHeight + rectH * sinValue, -rectH * cosValue); 
      if (shape === 'rect') {
        addLine(-rectW / 2, objHeight + rectH * sinValue, -rectH * cosValue); 
        addLine(rectW / 2, objHeight + rectH * sinValue, -rectH * cosValue);  
      }
      addLine(-rectW / 2, objHeight, 0); 
      addLine(rectW / 2, objHeight, 0);  
    } else if (shape === 'circle') {
      addLine(0, objHeight + (circleRad * 2) * sinValue, -(circleRad * 2) * cosValue); 
      addLine(-circleRad, objHeight + circleRad * sinValue, -circleRad * cosValue); 
      addLine(circleRad, objHeight + circleRad * sinValue, -circleRad * cosValue);  
    } else if (shape === 'line') {
      addLine(0, objHeight + lineLen * sinValue, -lineLen * cosValue);
    }
    return lines;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#f1f2f6', color: '#2f3542', fontFamily: 'sans-serif' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '15px', minWidth: '360px', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
        <h2 style={{ marginTop: 0, color: '#2980b9', fontSize: '20px' }}>📘 정사영 & 이면각 실험실 by ET</h2>
        
        {/* 1. 도형 선택 */}
        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#57606f', fontWeight: 'bold' }}>1. 도형 선택</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px', marginBottom: '10px' }}>
            <button onClick={() => setShape('line')} style={btnStyle(shape === 'line')}>선분</button>
            <button onClick={() => setShape('circle')} style={btnStyle(shape === 'circle')}>원</button>
            <button onClick={() => setShape('rect')} style={btnStyle(shape === 'rect')}>사각</button>
            <button onClick={() => setShape('triangle')} style={btnStyle(shape === 'triangle')}>삼각</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px' }}>
            <button onClick={() => setShape('cylinder')} style={btnStyle3D(shape === 'cylinder')}>원기둥</button>
            <button onClick={() => setShape('box')} style={btnStyle3D(shape === 'box')}>사각기둥</button>
            <button onClick={() => setShape('cone')} style={btnStyle3D(shape === 'cone')}>원뿔</button>
            <button onClick={() => setShape('pyramid')} style={btnStyle3D(shape === 'pyramid')}>사각뿔</button>
          </div>
        </div>

        {/* 2. 각도 설정 */}
        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#57606f', fontWeight: 'bold' }}>2. 각도 설정 (θ): <span style={{color:'#e67e22'}}>{angle}°</span></p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            {[0, 30, 45, 60, 90].map(v => (
              <button key={v} onClick={() => handleAngleChange(v)} style={{ flex: 1, margin: '0 2px', padding: '5px 0', borderRadius: '4px', border: '1px solid #3498db', backgroundColor: angle === v ? '#3498db' : 'white', color: angle === v ? 'white' : '#3498db', fontWeight: 'bold', cursor: 'pointer' }}>{v}°</button>
            ))}
          </div>
          <input type="range" min="0" max="90" step="1" value={angle} onChange={(e) => handleAngleChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#2980b9' }} />
        </div>

        {/* 3. 높이 조절 */}
        <div style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px', border: '1px solid #dfe4ea' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#57606f', fontWeight: 'bold' }}>3. 부양 높이 조절: <span style={{color:'#2980b9'}}>{objHeight.toFixed(2)}</span></p>
          <input type="range" min="0" max="10" step="0.1" value={objHeight} onChange={(e) => setObjHeight(Number(e.target.value))} style={{ width: '100%', marginBottom: '10px', accentColor: '#27ae60' }} />
          <button onClick={handleSnapToFloor} style={{ width: '100%', padding: '10px', backgroundColor: '#f39c12', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', color: 'white' }}>👇 현재 각도에서 바닥에 밀착</button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', color: '#2980b9', fontSize: '14px' }}>
            <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} style={{ transform: 'scale(1.2)', marginRight: '10px' }} />
            📐 보조선 및 직각기호 표시
          </label>
        </div>

        {/* [최종 수정] 무리수 결과창 */}
        <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '10px', borderLeft: is3D ? '5px solid #9b59b6' : '5px solid #3498db', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          {!is3D ? (
            <>
              <div style={{ marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px dashed #eee' }}>
                <span style={{ fontSize: '12px', color: '#95a5a6', fontWeight: 'bold' }}>공식: </span>
                <code style={{ fontSize: '15px', color: '#e74c3c', fontWeight: 'bold' }}>{formula}</code>
              </div>
              <p style={{ margin: '0 0 5px 0', color: '#7f8c8d', fontSize: '13px' }}>원래 값 ({symbol}): <span style={{color:'#2c3e50', fontWeight:'bold'}}>{originalLabel}</span></p>
              
              <div style={{ marginTop: '8px', padding: '10px', backgroundColor: '#f1f2f6', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#2980b9', fontWeight: 'bold' }}>정확한 값 ({symbol}')</p>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>= {exactResult}</div>
                <div style={{ marginTop: '5px', fontSize: '18px', fontWeight: 'bold', color: '#27ae60' }}>
                  ≈ {approxResult}
                </div>
              </div>
            </>
          ) : (
            <p style={{ margin: 0, color: '#8e44ad', fontSize: '13px', fontWeight: 'bold' }}>[입체도형 모드]</p>
          )}
        </div>
      </div>

      <Canvas shadows camera={{ position: [12, 12, 15], fov: 45 }}>
        <color attach="background" args={['#f1f2f6']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[0, 20, 0]} intensity={2.0} castShadow />
        <OrbitControls target={[0, 0, 0]} />

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[50, 50]} /><meshStandardMaterial color="#dfe4ea" /></mesh>
        <gridHelper args={[50, 50, '#a4b0be', '#ced6e0']} />

        {showHelper && !is3D && (
          <group>
            {getProjectionLines().map((pts, idx) => (
              <Line key={idx} points={pts} color="#2f3542" lineWidth={1.5} dashed dashSize={0.2} gapSize={0.15} />
            ))}
            <Line points={[[0, 0.02, 0], [0, 0.02, -helperLen * cosValue]]} color="#e67e22" lineWidth={4} />
            <Line points={[[0, 0.02, -helperLen * cosValue], [0, objHeight + helperLen * sinValue, -helperLen * cosValue]]} color="#e67e22" lineWidth={3} dashed />
            
            <group position={[0, objHeight + helperLen * sinValue, -helperLen * cosValue]} rotation={[angleRad, 0, 0]}>
               <Line points={[[0, -0.5, 0], [0.5, -0.5, 0], [0.5, 0, 0]]} color="#e74c3c" lineWidth={3} />
            </group>

            <Line points={[[0.5, 0.02, 0], [0.5, 0.02, -0.5], [0, 0.02, -0.5]]} color="#e74c3c" lineWidth={3} />
            <Line points={[[0, 0.5, -helperLen * cosValue], [0, 0.5, -helperLen * cosValue + 0.5], [0, 0.02, -helperLen * cosValue + 0.5]]} color="#2980b9" lineWidth={3} />

            {objHeight <= 0.3 && angle > 0 && (
              <group>
                <Line points={Array.from({length:25}, (_,i)=> [0, objHeight + 2*Math.sin((i/24)*angleRad), -2*Math.cos((i/24)*angleRad)])} color="#d35400" lineWidth={5} />
                <Html position={[0, 2.8 * Math.sin(angleRad/2), -2.8 * Math.cos(angleRad/2)]} center>
                  <div style={{color:'#d35400', fontSize:'22px', fontWeight:'900', textShadow:'2px 2px white'}}>θ = {angle}°</div>
                </Html>
              </group>
            )}
          </group>
        )}

        <group position={[0, objHeight, 0]} rotation={[angleRad, 0, 0]}>
          {!is3D && showHelper && (
            <group>
              <Line points={[[0, 0.06, 0], [0, 0.06, -helperLen]]} color="#27ae60" lineWidth={4} />
              <Line points={[[0.5, 0.06, 0], [0.5, 0.06, -0.5], [0, 0.06, -0.5]]} color="#27ae60" lineWidth={3} />
            </group>
          )}

          {shape === 'line' && <mesh castShadow rotation={[Math.PI/2, 0, 0]} position={[0, 0, -lineLen/2]}><cylinderGeometry args={[0.08, 0.08, lineLen, 16]} /><meshStandardMaterial color="#3498db" /></mesh>}
          {shape === 'circle' && <mesh castShadow position={[0, 0, -circleRad]}><cylinderGeometry args={[circleRad, circleRad, 0.05, 32]} /><meshStandardMaterial color="#3498db" transparent opacity={0.8} /></mesh>}
          {shape === 'rect' && <mesh castShadow position={[0, 0, -rectH/2]}><boxGeometry args={[rectW, 0.05, rectH]} /><meshStandardMaterial color="#3498db" transparent opacity={0.8} /></mesh>}
          {shape === 'triangle' && <mesh castShadow rotation={[-Math.PI/2, 0, 0]}><extrudeGeometry args={[triangleShape, { depth: 0.05, bevelEnabled: false }]} /><meshStandardMaterial color="#3498db" transparent opacity={0.8} /></mesh>}

          {is3D && (
            <mesh castShadow position={[0, rectH/2, 0]} rotation={shape === 'pyramid' ? [0, Math.PI/4, 0] : [0, 0, 0]}>
              {shape === 'cylinder' && <cylinderGeometry args={[circleRad, circleRad, rectH, 32]} />}
              {shape === 'box' && <boxGeometry args={[rectW, rectH, objDepth]} />}
              {(shape === 'cone' || shape === 'pyramid') && <coneGeometry args={[circleRad, rectH, shape === 'cone' ? 32 : 4]} />}
              <meshStandardMaterial color="#9b59b6" transparent opacity={0.8} />
            </mesh>
          )}
        </group>
      </Canvas>
    </div>
  )
}

const btnStyle = (isActive) => ({ padding: '8px 0', border: '1px solid #ced6e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', backgroundColor: isActive ? '#3498db' : '#ffffff', color: isActive ? 'white' : '#57606f' })
const btnStyle3D = (isActive) => ({ padding: '8px 0', border: '1px solid #ced6e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', backgroundColor: isActive ? '#9b59b6' : '#ffffff', color: isActive ? 'white' : '#57606f' })
