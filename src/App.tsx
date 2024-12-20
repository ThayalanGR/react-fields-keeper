import { useEffect } from 'react';
import { examples } from './Examples';

export default function App() {
    // effects
    useEffect(() => {
        const exampleId = window.location.hash.replace('#', '');
        if (exampleId) {
            const targetElement = document.getElementById(exampleId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, []);

    // handlers
    // Function to handle copying the link
    const copyLink = (exampleId: string) => {
        const link = `${window.location.origin}${window.location.pathname}#${exampleId}`;
        navigator.clipboard
            .writeText(link)
            .then(() => {
                alert('Link copied to clipboard!');
            })
            .catch((error) => {
                console.error('Failed to copy link', error);
            });
    };

    // Generate GitHub URL for each example
    const getGitHubCodeLink = (fileName: string) => {
        return `https://github.com/ThayalanGR/react-fields-keeper/blob/main/src/Examples/${fileName}.tsx`;
    };

    return (
        <div className="app-wrapper">
            <div className="header-wrapper">
                <h1>React Fields Keeper</h1>
                <div className="header-links-wrapper">
                    <a
                        href="https://github.com/thayalangr/react-fields-keeper/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src="https://img.shields.io/github/stars/thayalangr/react-fields-keeper?style=social"
                            alt="GitHub Stars"
                        />
                    </a>

                    <a
                        href="https://www.npmjs.com/package/react-fields-keeper"
                        target="_blank"
                        rel="noopener noreferrer"
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
                {Object.entries(examples).map(([exampleKey, Example], key) => {
                    const exampleId = `example-${key + 1}`;
                    const devItemIndices: number[] = [];
                    if (
                        devItemIndices.length &&
                        !devItemIndices.includes(key + 1)
                    )
                        return null;
                    return (
                        <div key={key} className="example-card" id={exampleId}>
                            <div className="example-content">
                                <Example />
                            </div>
                            <div className="example-links">
                                <button
                                    className="copy-link-button"
                                    onClick={() => copyLink(exampleId)}
                                >
                                    Copy Link
                                </button>
                                <a
                                    className="github-code-button"
                                    href={getGitHubCodeLink(exampleKey)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View Code on GitHub
                                </a>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
