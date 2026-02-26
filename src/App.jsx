import React, { useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Html, Line } from '@react-three/drei'
import * as THREE from 'three'

export default function App() {
  const [shape, setShape] = useState('circle')
  const [angle, setAngle] = useState(30) 
  const [objHeight, setObjHeight] = useState(0.01)
  const [showHelper, setShowHelper] = useState(true)
  const [isSnapped, setIsSnapped] = useState(true)

  // 수치 조절 상태
  const [lineLen, setLineLen] = useState(6)
  const [circleRad, setCircleRad] = useState(3)
  const [rectW, setRectW] = useState(6) 
  const [rectH, setRectH] = useState(6) 
  const [solidHeight, setSolidHeight] = useState(6) 

  const angleRad = (angle * Math.PI) / 180
  const cosValue = Math.cos(angleRad)
  const sinValue = Math.sin(angleRad)

  const is3D = ['cylinder', 'box', 'cone', 'pyramid'].includes(shape)

  // 바닥 밀착 높이 (모두 모서리를 축으로 회전하므로 0.01 고정)
  const getFloorHeight = () => 0.01;

  const handleAngleChange = (newAngle) => {
    setAngle(newAngle);
    if (isSnapped) setObjHeight(getFloorHeight());
  }

  const handleHeightChange = (newHeight) => {
    setObjHeight(newHeight);
    const snappedH = getFloorHeight();
    if (Math.abs(newHeight - snappedH) < 0.1) setIsSnapped(true);
    else setIsSnapped(false);
  }

  const handleSnapToFloor = () => {
    setObjHeight(getFloorHeight());
    setIsSnapped(true);
  }

  const handleShapeChange = (newShape) => {
    setShape(newShape);
    setObjHeight(getFloorHeight());
    setIsSnapped(true);
  }

  // 특수각 루트 및 파이 계산 로직
  const getCosInfo = (ang) => {
    if (ang === 0) return { text: "1", coeff: 1, suffix: "" };
    if (ang === 30) return { text: "√3/2", coeff: 0.5, suffix: "√3" };
    if (ang === 45) return { text: "√2/2", coeff: 0.5, suffix: "√2" };
    if (ang === 60) return { text: "1/2", coeff: 0.5, suffix: "" };
    if (ang === 90) return { text: "0", coeff: 0, suffix: "" };
    return { text: Math.cos((ang * Math.PI) / 180).toFixed(3), coeff: Math.cos((ang * Math.PI) / 180), suffix: "" };
  }

  let originalLabel = '', step1 = '', step2 = '', approxResult = '', formula = '', symbol = '';
  const cosInfo = getCosInfo(angle);
  
  if (!is3D) {
    let baseVal = 0; let isPi = false;
    if (shape === 'line') { symbol = 'l'; baseVal = lineLen; originalLabel = `${lineLen}`; formula = `l' = l × cos(θ)`; }
    else if (shape === 'circle') { symbol = 'S'; baseVal = Math.pow(circleRad, 2); isPi = true; originalLabel = `${baseVal}π`; formula = `S' = S × cos(θ)`; }
    else if (shape === 'rect') { symbol = 'S'; baseVal = rectW * rectH; originalLabel = `${baseVal}`; formula = `S' = S × cos(θ)`; }
    else if (shape === 'triangle') { symbol = 'S'; baseVal = (rectW * rectH) / 2; originalLabel = `${baseVal}`; formula = `S' = S × cos(θ)`; }
    
    step1 = `${originalLabel} × ${cosInfo.text}`;
    const finalCoeff = baseVal * cosInfo.coeff;
    step2 = `${finalCoeff === 1 && cosInfo.suffix ? "" : finalCoeff}${cosInfo.suffix}${isPi ? "π" : ""}`;
    approxResult = (baseVal * cosValue).toFixed(2) + (isPi ? "π" : "");
  }

  const triangleShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-rectW / 2, 0); s.lineTo(rectW / 2, 0); s.lineTo(0, rectH);
    return s;
  }, [rectW, rectH]);

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
      addLine(-rectW / 2, objHeight, 0); addLine(rectW / 2, objHeight, 0);  
    } else if (shape === 'circle') {
      addLine(0, objHeight + (circleRad * 2) * sinValue, -(circleRad * 2) * cosValue); 
      addLine(-circleRad, objHeight + circleRad * sinValue, -circleRad * cosValue); 
      addLine(circleRad, objHeight + circleRad * sinValue, -circleRad * cosValue);  
    } else if (shape === 'line') {
      addLine(0, objHeight + lineLen * sinValue, -lineLen * cosValue);
    }
    return lines;
  }

  // 삼각뿔 전용 스케일 및 반지름 계산
  const pyramidR = rectW / Math.sqrt(3);
  const pyramidScaleZ = rectH / (1.5 * pyramidR);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#f1f2f6', color: '#2f3542', fontFamily: 'sans-serif' }}>
      
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.95)', padding: '20px', borderRadius: '15px', minWidth: '360px', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
        <h2 style={{ marginTop: 0, color: '#2980b9', fontSize: '18px' }}>📘 정사영 실험실 (최종 통합본)</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#57606f', fontWeight: 'bold' }}>1. 도형 선택</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px', marginBottom:'5px' }}>
            {['line', 'circle', 'rect', 'triangle'].map(s => (
              <button key={s} onClick={() => handleShapeChange(s)} style={btnStyle(shape === s)}>{s === 'line' ? '선분' : s === 'circle' ? '원' : s === 'rect' ? '사각' : '삼각'}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '5px' }}>
            {['cylinder', 'box', 'cone', 'pyramid'].map(s => (
              <button key={s} onClick={() => handleShapeChange(s)} style={btnStyle3D(shape === s)}>{s === 'cylinder' ? '원기둥' : s === 'box' ? '사각기둥' : s === 'cone' ? '원뿔' : '삼각뿔'}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#fdf9f2', borderRadius: '10px', border: '1px solid #f39c12' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#e67e22', fontWeight: 'bold' }}>2. 수치 조절</p>
          {shape === 'line' && <><label style={{fontSize:'11px'}}>길이: {lineLen}</label><input type="range" min="1" max="15" step="0.5" value={lineLen} onChange={(e)=>setLineLen(Number(e.target.value))} style={{width:'100%'}} /></>}
          {['circle', 'cylinder', 'cone'].includes(shape) && <><label style={{fontSize:'11px'}}>반지름: {circleRad}</label><input type="range" min="1" max="8" step="0.1" value={circleRad} onChange={(e)=>setCircleRad(Number(e.target.value))} style={{width:'100%'}} /></>}
          {['rect', 'triangle', 'box', 'pyramid'].includes(shape) && <><label style={{fontSize:'11px'}}>가로: {rectW}</label><input type="range" min="1" max="12" step="0.5" value={rectW} onChange={(e)=>setRectW(Number(e.target.value))} style={{width:'100%'}} /><label style={{fontSize:'11px', marginTop:'5px', display:'block'}}>세로(밑면높이): {rectH}</label><input type="range" min="1" max="12" step="0.5" value={rectH} onChange={(e)=>setRectH(Number(e.target.value))} style={{width:'100%'}} /></>}
          {is3D && <><label style={{fontSize:'11px', marginTop:'5px', display:'block'}}>입체 높이: {solidHeight}</label><input type="range" min="1" max="12" step="0.5" value={solidHeight} onChange={(e)=>setSolidHeight(Number(e.target.value))} style={{width:'100%'}} /></>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#57606f', fontWeight: 'bold' }}>3. 각도 설정 (θ): <span style={{color:'#e67e22'}}>{angle}°</span></p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            {[0, 30, 45, 60, 90].map(v => (
              <button key={v} onClick={() => handleAngleChange(v)} style={{ flex: 1, margin: '0 2px', padding: '6px 0', borderRadius: '4px', border: '1px solid #3498db', backgroundColor: angle === v ? '#3498db' : 'white', color: angle === v ? 'white' : '#3498db', fontWeight: 'bold', cursor: 'pointer', fontSize:'12px' }}>{v}°</button>
            ))}
          </div>
          <input type="range" min="0" max="90" step="1" value={angle} onChange={(e) => handleAngleChange(Number(e.target.value))} style={{ width: '100%', accentColor: '#2980b9' }} />
        </div>

        <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: isSnapped ? '#e3f2fd' : '#f8f9fa', borderRadius: '10px', border: isSnapped ? '1px solid #2196f3' : '1px solid #dfe4ea' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '13px', color: '#57606f', fontWeight: 'bold' }}>4. 부양 높이: {objHeight.toFixed(2)}</p>
          <input type="range" min="0" max="10" step="0.1" value={objHeight} onChange={(e) => handleHeightChange(Number(e.target.value))} style={{ width: '100%', marginBottom: '8px' }} />
          <button onClick={handleSnapToFloor} style={{ width: '100%', padding: '8px', backgroundColor: '#f39c12', border: 'none', borderRadius: '5px', fontWeight: 'bold', color: 'white', cursor: 'pointer', fontSize:'12px' }}>👇 바닥에 밀착</button>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold', color: '#2980b9', fontSize: '13px' }}>
            <input type="checkbox" checked={showHelper} onChange={(e) => setShowHelper(e.target.checked)} style={{ marginRight: '8px' }} />
            📐 보조선 및 수직표시
          </label>
        </div>

        {!is3D && (
          <div style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '10px', borderLeft: '5px solid #3498db', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', color: '#95a5a6', marginBottom: '5px' }}>정사영 계산 과정</div>
            <div style={{ fontSize: '15px', color: '#2980b9', fontWeight: 'bold', marginBottom: '8px' }}>공식: {formula}</div>
            <div style={{ fontSize: '14px', color: '#2c3e50' }}>{symbol}' = {step1}</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e67e22', margin: '4px 0' }}>= {step2}</div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#27ae60', borderTop: '1px solid #eee', paddingTop: '4px' }}>≈ {approxResult}</div>
          </div>
        )}
      </div>

      <Canvas shadows camera={{ position: [15, 15, 20], fov: 45 }}>
        <color attach="background" args={['#f1f2f6']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[0, 40, 0]} intensity={2.2} castShadow shadow-mapSize={[2048, 2048]}>
          <orthographicCamera attach="shadow-camera" args={[-30, 30, 30, -30, 0.1, 80]} />
        </directionalLight>

        <OrbitControls target={[0, 0, 0]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[100, 100]} /><meshStandardMaterial color="#dfe4ea" /></mesh>
        <gridHelper args={[50, 50, '#a4b0be', '#ced6e0']} />
        
        <group position={[0, objHeight, 0]} rotation={[angleRad, 0, 0]}>
          {!is3D && (
            <group>
              {shape === 'line' && <mesh castShadow rotation={[Math.PI/2, 0, 0]} position={[0, 0, -lineLen/2]}><cylinderGeometry args={[0.08, 0.08, lineLen, 16]} /><meshStandardMaterial color="#3498db" /></mesh>}
              {shape === 'circle' && <mesh castShadow position={[0, 0, -circleRad]}><cylinderGeometry args={[circleRad, circleRad, 0.05, 32]} /><meshStandardMaterial color="#3498db" transparent opacity={0.8} /></mesh>}
              {shape === 'rect' && <mesh castShadow position={[0, 0, -rectH/2]}><boxGeometry args={[rectW, 0.05, rectH]} /><meshStandardMaterial color="#3498db" transparent opacity={0.8} /></mesh>}
              {shape === 'triangle' && <mesh castShadow rotation={[-Math.PI/2, 0, 0]}><extrudeGeometry args={[triangleShape, { depth: 0.05, bevelEnabled: false }]} /><meshStandardMaterial color="#3498db" transparent opacity={0.8} /></mesh>}
            </group>
          )}
          {is3D && (
            <group>
              {shape === 'cylinder' && <mesh castShadow position={[0, solidHeight/2, -circleRad]}><cylinderGeometry args={[circleRad, circleRad, solidHeight, 32]} /><meshStandardMaterial color="#9b59b6" transparent opacity={0.8} /></mesh>}
              {shape === 'box' && <mesh castShadow position={[0, solidHeight/2, -rectH/2]}><boxGeometry args={[rectW, solidHeight, rectH]} /><meshStandardMaterial color="#9b59b6" transparent opacity={0.8} /></mesh>}
              {shape === 'cone' && <mesh castShadow position={[0, solidHeight/2, -circleRad]}><coneGeometry args={[circleRad, solidHeight, 32]} /><meshStandardMaterial color="#9b59b6" transparent opacity={0.8} /></mesh>}
              
              {/* Z-Scale 및 포지션 조정을 적용한 삼각뿔 */}
              {shape === 'pyramid' && (
                <mesh 
                  castShadow 
                  position={[0, solidHeight / 2, -rectH / 3]} 
                  rotation={[0, Math.PI, 0]} 
                  scale={[1, 1, pyramidScaleZ]}
                >
                  <coneGeometry args={[pyramidR, solidHeight, 3]} />
                  <meshStandardMaterial color="#9b59b6" transparent opacity={0.8} />
                </mesh>
              )}
            </group>
          )}
        </group>

        {showHelper && !is3D && (
          <group>
            {/* 이면각 보조선 (녹색) */}
            <group position={[0, objHeight, 0]} rotation={[angleRad, 0, 0]}>
              <Line points={[[0, 0.05, 0], [0, 0.05, -helperLen]]} color="#27ae60" lineWidth={5} />
              <Line points={[[0.4, 0.05, 0], [0.4, 0.05, -0.4], [0, 0.05, -0.4]]} color="#27ae60" lineWidth={2.5} />
            </group>
            
            {/* 정사영 보조선 (주황색) */}
            <Line points={[[0, 0.02, 0], [0, 0.02, -helperLen * cosValue]]} color="#e67e22" lineWidth={5} />
            <Line points={[[0.4, 0.02, 0], [0.4, 0.02, -0.4], [0, 0.02, -0.4]]} color="#e67e22" lineWidth={2.5} />
            
            {/* 수직 수선 */}
            <Line points={[[0, 0.02, -helperLen * cosValue], [0, objHeight + helperLen * sinValue, -helperLen * cosValue]]} color="#e74c3c" lineWidth={2} dashed />
            
            {/* 직각 표시 */}
            <group position={[0, 0.02, -helperLen * cosValue]}>
               <Line points={[[0, 0.4, 0], [0, 0.4, 0.4], [0, 0, 0.4]]} color="#e74c3c" lineWidth={2.5} />
            </group>

            {/* 투영 가이드 점선 */}
            {getProjectionLines().map((pts, idx) => (
              <Line key={idx} points={pts} color="#2f3542" lineWidth={1.2} dashed dashSize={0.2} gapSize={0.15} />
            ))}
            
            {/* 각도 텍스트 */}
            {angle > 0 && isSnapped && (
              <group>
                <Line points={Array.from({length:20}, (_,i)=> [0, objHeight + 2.5*Math.sin((i/19)*angleRad), -2.5*Math.cos((i/19)*angleRad)])} color="#d35400" lineWidth={4} />
                <Html position={[0, objHeight + 3 * Math.sin(angleRad/2), -3 * Math.cos(angleRad/2)]} center>
                  <div style={{color:'#d35400', fontSize:'20px', fontWeight:'900', textShadow:'1px 1px white'}}>θ = {angle}°</div>
                </Html>
              </group>
            )}
          </group>
        )}
      </Canvas>
    </div>
  )
}

const btnStyle = (isActive) => ({ padding: '8px 0', border: '1px solid #ced6e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', backgroundColor: isActive ? '#3498db' : '#ffffff', color: isActive ? 'white' : '#57606f' })
const btnStyle3D = (isActive) => ({ padding: '8px 0', border: '1px solid #ced6e0', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', backgroundColor: isActive ? '#9b59b6' : '#ffffff', color: isActive ? 'white' : '#57606f' })
