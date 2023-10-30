export type Broker = 'Fyers' | 'Zerodha';

export interface IHoldingOptions {
	sheetName: string,
	options: any
}

export interface IHolding {
	symbol: string,
	ISIN: string,
	sector: string | null,
	quantity: number,
	averageBuyPrice: number,
	invested: number,
	currentMarketPrice: number,
	currentValue: number,
	unrealizedProfitAndLoss: number,
	unrealizedProfitAndLossPercent: number,
}

export interface IFyersHolding {
	symbol: string,
	totalQuantity: number,
	buyPrice: number,
	buyValue: number,
	previousClose: number,
	currentValue: number,
	PnL: number,
	unrealizePnLPct: number,
	ISIN: string,
	precentValuePercent: number,
	investedValuePercent: number
}

export interface IZerodhaHolding {
	symbol: string
	ISIN: string,
	sector: string,
	instrumentType: string,
	quantityAvailable: number,
	quantityDiscrepant: number,
	quantityLongTerm: number,
	quantityPledgedMargin: number,
	quantityPledgedLoan: number,
	averagePrice: number,
	previousClosingPrice: number,
	unrealizedPnL: number,
	unrealizePnLPct: number,
}

export interface ISymbolSectorMapping {
	[key: string] : {
		"symbol": string,
        "name": string,
        "sector": string
	}
}

export interface IAccount {
	accountName: string,
	holdings: IHolding[],
	totalInvested: number
}

export type IHoldingWithAccountOptions = Omit<IAccount, 'accountName'>

export interface IOverallHoldingBreakdown extends IHolding {
	accountName: string
}

export interface IOverallHolding extends IHolding {
	breakdown: IOverallHoldingBreakdown[]
}

export interface IFolioContext {
	accounts: IAccount[],
	addAccountAndUpdateState?: (account: IAccount) => void,
	removeAccountAndUpdateState?: (accountName: string) => void,
	setAccounts?: React.Dispatch<React.SetStateAction<IAccount[]>>,
	overallHoldings: IOverallHolding[],
	setOverallHoldings?: React.Dispatch<React.SetStateAction<IOverallHolding[]>>,
}
