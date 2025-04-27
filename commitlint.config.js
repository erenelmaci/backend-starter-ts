import pkg from './package.json';

// Check if the user has configured the package to use conventional commits.
const isConventional = pkg.config ? pkg.config['cz-emoji']?.conventional : false;

// Regex for default and conventional commits.
const RE_DEFAULT_COMMIT =
  /^(?::.*:|(?:\u00A9|\u00AE|[\u2000-\u3300]|\uD83C[\uD000-\uDFFF]|\uD83D[\uD000-\uDFFF]|\uD83E[\uD000-\uDFFF]))\s(?<emoji>\((?<scope>.*)\)\s)?.*$/gm;
const RE_CONVENTIONAL_COMMIT =
  /^^(?<type>\w+)(?:\((?<scope>\w+)\))?\s(?<emoji>:.*:|(?:\u00A9|\u00AE|[\u2000-\u3300]|\uD83C[\uD000-\uDFFF]|\uD83D[\uD000-\uDFFF]|\uD83E[\uD000-\uDFFF]))\s.*$/gm;

export default {
  rules: {
    'cz-emoji': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        // @ts-ignore
        'cz-emoji': ({ raw }) => {
          const isValid = isConventional
            ? RE_CONVENTIONAL_COMMIT.test(raw)
            : RE_DEFAULT_COMMIT.test(raw);

          const message = isConventional
            ? `Your commit message should follow conventional commit format.`
            : `Your commit message should be: <emoji> (<scope>)?: <subject>`;

          return [isValid, message];
        },
      },
    },
  ],
};
