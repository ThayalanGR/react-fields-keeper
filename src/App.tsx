import { examples } from './Examples';

export default function App() {
    return (
        <div className="app-wrapper">
            <div className="header-wrapper">
                <h1>React Fields Keeper</h1>
                <div className="header-links-wrapper">
                    <a
                        href="https://github.com/thayalangr/react-fields-keeper/"
                        target="_blank"
                    >
                        <img
                            src="https://img.shields.io/github/stars/thayalangr/react-fields-keeper?style=social"
                            alt="GitHub Stars"
                        />
                    </a>

                    <a
                        href="https://www.npmjs.com/package/react-fields-keeper"
                        target="_blank"
                    >
                        <img
                            src="https://img.shields.io/npm/v/react-fields-keeper"
                            alt="npm Version"
                        />
                    </a>
                </div>
            </div>

            <h2>Examples</h2>

            <div className="examples-wrapper">
                {examples.map((Example, key) => (
                    <Example key={key} />
                ))}
            </div>
        </div>
    );
}
