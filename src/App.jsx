import { useState } from 'react';

function App() {
  // Membuat state bernama 'angka' dengan nilai awal 0
  const [angka, setAngka] = useState(0);

  return (
    <div>
      <h1>Angka saat ini: {angka}</h1>
      <button onClick={() => setAngka(angka + 1)}>Tambah (+)</button>
      <button onClick={() => setAngka(angka - 1)}>Kurang (-)</button>
    </div>
  );
}

export default App;