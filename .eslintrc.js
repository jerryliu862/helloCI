module.exports = {
	parser: '@typescript-eslint/parser',
	extends: [
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',
		'prettier/@typescript-eslint',
		'plugin:prettier/recommended',
	],
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
	env: { es6: true },
	plugins: ['formatjs', 'react', 'react-hooks', '@typescript-eslint/eslint-plugin'],
	settings: {
		react: {
			version: 'detect',
		},
		'import/parsers': {
			'@typescript-eslint/parser': ['.ts', '.tsx'],
		},
		'import/resolver': {
			typescript: {
				alwaysTryTypes: true,
			},
			'babel-module': {},
			node: {
				extensions: ['.js', '.jsx', '.ts', '.tsx'],
			},
		},
	},
	rules: {
		'formatjs/no-offset': 'error',
		'react-hooks/rules-of-hooks': 'error',
		'@typescript-eslint/no-unused-vars': 0,
		'@typescript-eslint/camelcase': 0,
		'@typescript-eslint/no-explicit-any': 0,
		'@typescript-eslint/explicit-function-return-type': 0,
		'@typescript-eslint/no-empty-function': 0,
		'@typescript-eslint/no-use-before-define': 0,
		'@typescript-eslint/no-inferrable-types': 0,
		'@typescript-eslint/no-var-requires': 0,
		'react/prop-types': 0,
		'react/display-name': 0,
		'@typescript-eslint/interface-name-prefix': 0,
	},
};
