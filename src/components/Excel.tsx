import { read as readXlsx, utils as xlsxUtils } from "xlsx";
import './Excel.css'
import { useContext, useState } from 'react';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { styled } from '@mui/joy';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import FormHelperText from '@mui/joy/FormHelperText';
import RadioGroup from '@mui/joy/RadioGroup';
import Radio from '@mui/joy/Radio';
import symbolSectorMapping from '../assets/symbolSectorMapping.json'

import { 
	Broker, 
	IHoldingOptions, 
	IHoldingWithAccountOptions, 
	IHolding, 
	IFyersHolding, 
	IZerodhaHolding, 
	ISymbolSectorMapping 
} from '../types/Folio'
import { FolioContext } from '../pages/Folio'

const VisuallyHiddenInput = styled('input')`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const symbolSectorMappingData: ISymbolSectorMapping = symbolSectorMapping;

const getHoldingsOptionsFromSheet = (broker: Broker): IHoldingOptions => {
	if (broker === 'Zerodha') {
		return {
			sheetName: 'Combined',
			options: { 
				range: 23, 
				header: [
					"symbol",
					"ISIN",
					"sector",
					"instrumentType",
					"quantityAvailable",
					"quantityDiscrepant",
					"quantityLongTerm",
					"quantityPledgedMargin",
					"quantityPledgedLoan",
					"averagePrice",
					"previousClosingPrice",
					"unrealizedPnL",
					"unrealizePnLPct",
				]
			}
		}
	}
	// Fyers
	return {
		sheetName: 'Sheet1',
		options: { 
			range: 1,
			header: [
				"symbol",
				"totalQuantity",
				"buyPrice",
				"buyValue",
				"previousClose",
				"currentValue",
				"PnL",
				"unrealizePnLPct",
				"ISIN",
				"precentValuePercent",
				"investedValuePercent"
			]
		}
	}
}

const toHoldingInterface = (broker: Broker, jsonSheet: unknown[]): IHoldingWithAccountOptions => {
	if (broker === 'Zerodha') {
		return toHoldingInterfaceFromZerodha(jsonSheet as IZerodhaHolding[])
	}
	return toHoldingInterfaceFromFyers(jsonSheet as IFyersHolding[])
}

const getSector = (symbol: string) => {
	if (symbolSectorMappingData.hasOwnProperty(symbol))
		return symbolSectorMappingData[symbol].sector

	if (symbol.includes('GOLD'))
		return 'GOLD'

	if (symbol.includes('SGB'))
		return 'GOLD'

	if (symbol.includes('SILVER'))
		return 'SILVER'

	if (symbol.includes('NIFTYBEES'))
		return 'NIFTY50'

	if (symbol.includes('INDEX FUND'))
		return 'NIFTY50'

	if (symbol.includes('BEES'))
		return 'ETF'

	if (symbol.includes('FUND'))
		return 'MF'


		if (symbol.includes('ETF'))
		return 'ETF'
	return 'NONE'
}

const toHoldingInterfaceFromZerodha = (jsonSheet: IZerodhaHolding[]): IHoldingWithAccountOptions => {
	let totalInvested = 0
	const holdings: IHolding[] = jsonSheet.map(row => {

		let symbol = row.symbol.replace('-E', '')
		let invested = row.quantityAvailable * row.averagePrice
		totalInvested += invested

		let sector = getSector(symbol)
		
		return {
			symbol: symbol,
			ISIN: row.ISIN,
			sector: sector,
			quantity: row.quantityAvailable,
			averageBuyPrice: row.averagePrice,
			invested: invested,
			currentMarketPrice: row.previousClosingPrice,
			currentValue: row.quantityAvailable * row.previousClosingPrice,
			unrealizedProfitAndLoss: row.unrealizedPnL,
			unrealizedProfitAndLossPercent: row.unrealizePnLPct,		
		}
	})
	
	return { holdings, totalInvested }
}

const toHoldingInterfaceFromFyers = (jsonSheet: IFyersHolding[]): IHoldingWithAccountOptions => {
	let totalInvested = 0
	const holdings: IHolding[] = jsonSheet.map(row => {
		totalInvested += row.buyValue
		
		let symbol = row.symbol.replace('NSE:', '').replace('-EQ', '')
		
		let sector = getSector(symbol)

		return {
			symbol: symbol,
			ISIN: row.ISIN,
			sector: sector,
			quantity: row.totalQuantity,
			averageBuyPrice: row.buyPrice,
			invested: row.buyValue,
			currentMarketPrice: row.previousClose,
			currentValue: row.currentValue,
			unrealizedProfitAndLoss: row.PnL,
			unrealizedProfitAndLossPercent: row.unrealizePnLPct,		
		}
	})
	
	return { holdings, totalInvested }
}

async function readFileSyncAsArrayBuffer(file: File): Promise<ArrayBuffer> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = (event) => {
			const arrayBuffer = event?.target?.result as ArrayBuffer;
			resolve(arrayBuffer);
		};

		reader.onerror = (error) => {
			reject(error);
		};

		reader.readAsArrayBuffer(file);
	});
}

export function Excel() {
	const [broker, setBroker] = useState<Broker>('Fyers')
	const [accountName, setAccountName] = useState<string>('')
	const [accountNameError, setAccountNameError] = useState<string>('')
	const [fileError, setFileError] = useState<string>('')
	const [holdingsFile, setHoldingsFile] = useState<File>()

	const { addAccountAndUpdateState } = useContext(FolioContext)

	const handleNewFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) return
		if (!event.target.files.length) return
		if (!broker) return
		console.log('event.target.files -->', event.target.files);
		setHoldingsFile(event.target.files[0])
	}
	
	const handleBrokerClick = (e: React.ChangeEvent<HTMLInputElement>) => {
		setBroker(e.target.value as Broker)
	}

	const formSubmit = async () => {
		if (!accountName) {
			setAccountNameError('Please enter a valid account name')
			return
		}
		
		if (!holdingsFile) {
			setFileError('Please select a holdings file')
			return
		}
		
		let buffer;
		try {
			buffer = await readFileSyncAsArrayBuffer(holdingsFile)
		} catch (error) {
			console.log('error -->', error);
			return
		}
		
		let workbook = readXlsx(buffer)
		
		const {sheetName, options} = getHoldingsOptionsFromSheet(broker)
		
		const jsonSheet = xlsxUtils.sheet_to_json(workbook.Sheets[sheetName], options)

		const holding = toHoldingInterface(broker, jsonSheet)

		addAccountAndUpdateState && addAccountAndUpdateState({
			accountName,
			...holding
		})
	}

	return (
		<Box sx={{ display: 'grid', gap: 3 }}>
			<FormControl>
				<FormLabel>Broker</FormLabel>
				<RadioGroup 
					defaultValue="Fyers" 
					name="radio-buttons-group"
					onChange={handleBrokerClick}
				>
					<Radio
						value="Fyers"
						label="Fyers"
						slotProps={{ input: { 'aria-describedby': 'fyers-helper-text' } }}
					/>
					<FormHelperText id="fyers-helper-text">
						Export holdings from 
						"My Account ➡️ Holdings ➡️ Export"
					</FormHelperText>
					<Radio value="Zerodha" label="Zerodha" />
				</RadioGroup>
			</FormControl>
			<FormControl>
				<FormLabel>Account Name</FormLabel>
				<Input 
					type="text" 
					onChange={(e) => setAccountName(e.target.value)} 
					value={accountName} 
					/>
				{accountNameError && <p className="error-msg">{accountNameError}</p>}
			</FormControl>
			
			<FormControl>
				<FormLabel>Exported file</FormLabel>
				<Button
					component="label"
					role={undefined}
					tabIndex={-1}
					variant="outlined"
					color="neutral"
					endDecorator={<FileUploadIcon />}
					>
					{holdingsFile ? holdingsFile.name : 'Exported File'}
					<VisuallyHiddenInput type="file" onChange={handleNewFile} accept=".xls, .xlsx, .csv" />
				</Button>
				{fileError && <p className="error-msg">{fileError}</p>}
			</FormControl>

			<Button onClick={formSubmit}>Add Holdings</Button>
		</Box>
	)
}