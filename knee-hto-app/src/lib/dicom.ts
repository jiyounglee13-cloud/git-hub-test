// 브라우저에서 DICOM(.dcm) 영상을 grayscale PNG data URL 로 렌더.
// 비압축(MONOCHROME1/2, 8/16-bit) 지원. 압축 전송구문은 미지원(디코더 필요).
import dicomParser from "dicom-parser";

const UNCOMPRESSED_TS = new Set([
  "1.2.840.10008.1.2", // Implicit VR LE
  "1.2.840.10008.1.2.1", // Explicit VR LE
  "1.2.840.10008.1.2.2", // Explicit VR BE (드묾)
]);

export function isDicomFile(file: File): boolean {
  return (
    file.type === "application/dicom" ||
    /\.dcm$/i.test(file.name) ||
    /\.dicom$/i.test(file.name)
  );
}

export function renderDicomToDataUrl(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  const ds = dicomParser.parseDicom(byteArray);

  const transferSyntax = ds.string("x00020010") || "1.2.840.10008.1.2.1";
  if (!UNCOMPRESSED_TS.has(transferSyntax)) {
    throw new Error(
      `압축 DICOM(전송구문 ${transferSyntax})은 이 데모에서 미지원입니다. 비압축 영상으로 변환하거나 PNG/JPG를 사용하세요.`
    );
  }

  const rows = ds.uint16("x00280010");
  const cols = ds.uint16("x00280011");
  const bitsAllocated = ds.uint16("x00280100") || 16;
  const pixelRepresentation = ds.uint16("x00280103") || 0; // 0 unsigned, 1 signed
  const photometric = ds.string("x00280004") || "MONOCHROME2";
  const slope = parseFloat(ds.string("x00281053") || "1") || 1;
  const intercept = parseFloat(ds.string("x00281052") || "0") || 0;

  const pixelEl = ds.elements.x7fe00010;
  if (!rows || !cols || !pixelEl) {
    throw new Error("DICOM 픽셀 데이터를 찾을 수 없습니다.");
  }

  const n = rows * cols;
  // 픽셀 값 배열 구성 (rescale 적용)
  const vals = new Float32Array(n);
  if (bitsAllocated <= 8) {
    const src = new Uint8Array(byteArray.buffer, pixelEl.dataOffset, n);
    for (let i = 0; i < n; i++) vals[i] = src[i] * slope + intercept;
  } else {
    const base = byteArray.byteOffset + pixelEl.dataOffset;
    const src =
      pixelRepresentation === 1
        ? new Int16Array(byteArray.buffer, base, n)
        : new Uint16Array(byteArray.buffer, base, n);
    for (let i = 0; i < n; i++) vals[i] = src[i] * slope + intercept;
  }

  // Window/Level: 태그가 있으면 사용, 없으면 min/max
  let wc = parseFloat((ds.string("x00281050") || "").split("\\")[0]);
  let ww = parseFloat((ds.string("x00281051") || "").split("\\")[0]);
  if (!isFinite(wc) || !isFinite(ww) || ww <= 0) {
    let min = Infinity,
      max = -Infinity;
    for (let i = 0; i < n; i++) {
      if (vals[i] < min) min = vals[i];
      if (vals[i] > max) max = vals[i];
    }
    wc = (max + min) / 2;
    ww = Math.max(1, max - min);
  }
  const lo = wc - ww / 2;
  const invert = photometric === "MONOCHROME1";

  const canvas = document.createElement("canvas");
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("캔버스 컨텍스트 생성 실패");
  const img = ctx.createImageData(cols, rows);
  for (let i = 0; i < n; i++) {
    let g = ((vals[i] - lo) / ww) * 255;
    g = g < 0 ? 0 : g > 255 ? 255 : g;
    if (invert) g = 255 - g;
    const j = i * 4;
    img.data[j] = img.data[j + 1] = img.data[j + 2] = g;
    img.data[j + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
}
