import './App.css';
import ClientApiTester from './components/ClientApiTester';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>National Transport Commission of Sri Lanka</h1>
      </header>
      <div>
        <section><ClientApiTester /></section>
      </div>
    </div>
  );
}

export default App;
