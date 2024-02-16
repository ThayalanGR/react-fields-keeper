import { examples } from './Examples';

export default function App() {
    return (
        <div className="app-wrapper">
            <h1>React Fields Keeper</h1>

            <h3>Examples</h3>

            <div className="examples-wrapper">
                {examples.map((Example, key) => (
                    <Example key={key} />
                ))}
            </div>
        </div>
    );
}
