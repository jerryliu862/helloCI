import isNil from 'lodash/isNil';

export default class util {
	/**
	 * 處理浮點數加減問題
	 *
	 * @static
	 * @param {number|string} num1
	 * @param {number|string} num2
	 * @returns {number}
	 * @memberof util
	 */
	public static numAdd(num1: number | string = 0, num2: number | string = 0): number {
		let numNum1 = Number(num1);
		let numNum2 = Number(num2);
		let baseNum1: number;
		let baseNum2: number;

		if (isNaN(numNum1)) {
			console.warn(`[util.numAdd]: num1 must be a number or a number string, but the value of num1 is`, num1);
			numNum1 = 0;
		}

		if (isNaN(numNum2)) {
			console.warn(`[util.numAdd]: num2 must be a number or a number string, but the value of num2 is`, num2);
			numNum2 = 0;
		}

		try {
			baseNum1 = num1.toString().split('.')[1].length;
		} catch (e) {
			baseNum1 = 0;
		}
		try {
			baseNum2 = num2.toString().split('.')[1].length;
		} catch (e) {
			baseNum2 = 0;
		}
		const baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
		return Math.round((numNum1 + numNum2) * baseNum) / baseNum;
	}

	public static numMultiply(num1: number, num2: number): number {
		let baseNum1: number;
		let baseNum2: number;
		try {
			baseNum1 = num1.toString().split('.')[1].length;
		} catch (e) {
			baseNum1 = 0;
		}
		try {
			baseNum2 = num2.toString().split('.')[1].length;
		} catch (e) {
			baseNum2 = 0;
		}
		const baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
		const newNum1 = Math.round(num1 * baseNum);
		const newNum2 = Math.round(num2 * baseNum);
		return (newNum1 * newNum2) / baseNum / baseNum;
	}

	public static numRound(
		num: number,
		{
			fractionDigits = 2,
			roundMethod = 'round',
		}: { fractionDigits: number; roundMethod: 'ceil' | 'floor' | 'round' } = {} as any,
	) {
		const roundFn = Math[roundMethod] || Math.round;
		if (typeof roundFn !== 'function') {
			console.warn('[util.numRound]: roundMethod is invalid!');
			return num;
		}
		const result = roundFn(num * Math.pow(10, fractionDigits)) / Math.pow(10, fractionDigits);

		return result === 0 ? result : Number(result.toFixed(fractionDigits));
	}

	/**
	 * 金額數字格式化
	 *
	 * @static
	 * @param {string | number} value 未格式化金額
	 * @param decimalPlace 小數點後位數
	 * @returns {string} 格式化金額(ex: 1,000)
	 */
	public static amountFormat = (value: string | number, decimalPlace = 0): string => {
		const amount = !decimalPlace ? Number(value) : Number(value).toFixed(decimalPlace);
		if (isNil(amount) || amount === '') {
			return '';
		}
		const numArray = amount.toString().split('.');
		const regex = /(\d{1,3})(?=(\d{3})+$)/g;
		return numArray[0].replace(regex, '$1,') + (numArray.length == 2 ? '.' + numArray[1] : '');
	};

	public static formatScientificNumber = (value: string | number) => {
		if (!value) return 0;
		if (Number(value).toString().indexOf('e') === -1) {
			return value;
		} else {
			const fixedNum = Math.abs(Number(value.toString().split('e')[1]));
			const addFixedNum = Number(value.toString().split('e')[0]).toString().split('.')[1].length;
			return Number(value.toString().split('e')[1]) >= 0 ? value : Number(value).toFixed(fixedNum + addFixedNum);
		}
	};
}
