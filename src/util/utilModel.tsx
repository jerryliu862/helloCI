export enum ECookieName {
	COOKIE_AUTH_TOKEN = 'idjsn3',
}
export interface IBonusFilterCondition {
	campaignEndDate: moment.Moment | null;
	selectedRegionOptions: { label: string }[];
	selectedStatusOptions: { label: string }[];
	isCheckBonusZero: boolean;
	searchText: string;
}

export enum EFilterComboboxDataSetStateType {
	SELECT_REGION_OPTIONS = 'selectedRegionOptions',
	SELECT_STATUS_OPTIONS = 'selectedStatusOptions',
}

export interface IFilterCondition {
	billingMonth: moment.Moment | null;
	selectedRegionOptions: { label: string }[];
	selectedStatusOptions: { label: string }[];
}

export interface IFilterProps {
	options?: { label: string }[];
	setFilterCondition: React.Dispatch<React.SetStateAction<IFilterCondition>>;
	filterCondition: IFilterCondition;
	setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
	defaultCondition: any;
}

export interface UserList {
	createTime?: string;
	creatorUID?: number;
	email?: string;
	googleID?: string;
	modifierUID?: number;
	modifyTime?: string;
	name?: string;
	status?: number;
	uid?: number;
	editPermissions?: any;
}

export interface IAuthListItem {
	authLevel: EAuthLevelValue;
	authType: EAuthTypesValue;
	createTime: string;
	regionCode: string;
}

export interface IUserInfo {
	authList: IAuthListItem[] | [];
	createTime?: string;
	creatorName?: string;
	creatorUID?: number;
	email: string;
	googleID?: string;
	modifierUID?: number;
	modifyTime?: string;
	name?: string;
	status?: number;
	uid?: number;
}

export enum EAuthTypesValue {
	BONUS = 1,
	PAYOUT = 2,
	SYSTEM_ADMIN = 99,
	TAX_RATE = 4,
}

export enum EAuthLevelValue {
	READ = 1,
	EDIT = 2,
	APPROVE = 3,
}

export interface TaxRax {
	payType?: 'L' | 'F' | 'A';
	taxFrom?: number;
	taxRate?: number;
}

export interface RegionTaxList {
	code?: string;
	currencyCode?: string;
	currencyFormat?: string;
	currencyName?: string;
	name?: string;
	taxList?: TaxRax[];
}

export interface IResponse<T> {
	config: any;
	data: T;
	headers: any;
	request: any;
	status: number;
	statusText: string;
}
export interface IRankListItem {
	rank: number;
	score: number;
	openID: string;
	userID: string;
	userRegion: string;
	fixedBonus: number;
	variableBonus: number;
	totalBonus: number;
	name?: string;
	rankID?: number;
}

export interface ICampaignDetailData {
	leaderboardList?: ILeaderboardItem[] | [];
	syncTime?: string;
	id?: number;
	title?: string;
	region?: string;
	startTime?: number;
	endTime?: number;
	budget?: number | string;
	bonus?: number;
	totalBonus?: number;
	bonusDiff?: number;
	approvalStatus?: boolean;
	approvalTime?: number;
	approverName?: string;
	remark?: string;
}

export interface ILeaderboardItem {
	fixedBonus: number;
	leaderboardID: string;
	name: string;
	totalBonus: number;
	variableBonus: number;
	rankList?: IRankListItem[];
}

export interface IAdjustLeaderboardItem {
	leaderboardID: string;
	rankList: IRankListItem[];
}

export interface IPayout {
	id: number;
	payDate: string;
	region: string;
	fixedBonus: number;
	variableBonus: number;
	transportation: number;
	addon: number;
	dedution: number;
	total: number;
	budget: number;
	difference: number;
	status: boolean;
}

export interface ICampaignRank {
	rankID: number;
	userID: string;
	openID: string;
	campaignID: number;
	campaignCurrency: string;
	campaignTitle: string;
}

export enum EBonusType {
	FIXED_BONUS = 0,
	VARIABLE_BONUS = 1,
	TRANSPORTATION = 2,
	ADDON = 3,
	DEDUCTION = 4,
}

export interface IPayoutDetailListItem {
	openID: string;
	userID: string;
	region: string;
	campaignID: number;
	campaignTitle: string;
	bonusID: number;
	bonusType: number;
	amount: number;
	remark: string;
}

export enum EPayoutTabName {
	ALL = 'All',
	BONUS = 'Bonus',
	ADDON = 'Addon',
	DEDUCTION = 'Deduction',
	TRANSPORTATION = 'Transportation',
}

export enum EReportTabId {
	LOCAL = 'local',
	FOREIGN = 'foreign',
	AGENCY = 'agency',
	MISSING = 'missing',
}

export interface IReportDetailData {
	id: number;
	payDate: string;
	region: string;
	foreignAmount: number;
	localAmount: number;
	agencyAmount: number;
	streamerCount: number;
	missingCount: number;
	totalAmount: number;
	totalTaxAmount: number;
	afterTaxAmount: number;
	status: boolean;
}

export interface IReportDetailAgencyItem {
	agencyName: string;
	agencyID: number;
	totalAmount: number;
	totalTaxAmount: number;
	afterTaxAmount: number;
	bankCode: string;
	bankName: string;
	branchCode: string;
	branchName: string;
	bankAccount: string;
	bankAccountName: string;
	feeOwnerType: number;
	taxID: string;
	streamerList: [] | IReportDetailAgencyStreamer[];
}

export interface IReportDetailAgencyStreamer {
	userID: string;
	openID: string;
	streamerRegion: string;
	campaignTitle: string;
	payAmount: number;
}

export interface IReportDetailListItem {
	userID: string;
	openID: string;
	streamerRegion: string;
	payType: string;
	payAmount: number;
	taxAmount: number;
	afterTaxAmount: number;
	bankCode: string;
	bankName: string;
	branchCode: string;
	branchName: string;
	bankAccount: string;
	bankAccountName: string;
	feeOwnerType: number;
	taxID: string;
}

export enum EPayType {
	FOREIGN = 'F',
	LOCAL = 'L',
	AGENCY = 'A',
	MISSING = 'M',
}

export interface IReport {
	afterTaxAmount: number;
	agencyAmount: number;
	foreignAmount: number;
	id: number;
	localAmount: number;
	missingCount: number;
	payDate: string;
	region: string;
	status: boolean;
	streamerCount: number;
	totalAmount: number;
	totalTaxAmount: number;
}
