import './Folio.css'
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button'
import Add from '@mui/icons-material/Add';
import { useState, createContext, useEffect } from 'react';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import Sheet from '@mui/joy/Sheet';
import { Excel } from '../components/Excel'
import { Analytics } from '../components/Analytics'
import { OverallHoldings } from '../components/OverallHoldings'
import { IFolioContext, IAccount, IOverallHolding } from '../types/Folio'

export const FolioContext = createContext<IFolioContext>({
	accounts: [],
	overallHoldings: []
})

export function Folio() {
	const [open, setOpen] = useState(false);
	const [accounts, setAccounts] = useState<IAccount[]>([]);
	const [overallHoldings, setOverallHoldings] = useState<IOverallHolding[]>([]);

	useEffect(() => {
		const localAccounts = localStorage.getItem('accounts')
		if (localAccounts) {
			const updatedAccounts = JSON.parse(localAccounts) as IAccount[]
			setAccounts(updatedAccounts)
			updateOverallHoldings(updatedAccounts)
		}
	}, [])

	const updateOverallHoldings = (updatedAccounts: IAccount[]) => {
		const holdingMap: { [key: string]: IOverallHolding; } = {};
		updatedAccounts.forEach(account => {
			account.holdings.forEach(holding => {
				if (!holdingMap.hasOwnProperty(holding.ISIN)) {
					holdingMap[holding.ISIN] = {
						...holding,
						breakdown: [{
							accountName: account.accountName,
							...holding
						}],
					};
					return;
				}
				holdingMap[holding.ISIN].breakdown.push({
					accountName: account.accountName,
					...holding
				});
				holdingMap[holding.ISIN].quantity += holding.quantity;
				holdingMap[holding.ISIN].invested += holding.invested;
				holdingMap[holding.ISIN].averageBuyPrice = holdingMap[holding.ISIN].invested / holdingMap[holding.ISIN].quantity;
				holdingMap[holding.ISIN].currentMarketPrice = holding.currentMarketPrice;
				holdingMap[holding.ISIN].currentValue = holdingMap[holding.ISIN].currentMarketPrice * holdingMap[holding.ISIN].quantity;
				holdingMap[holding.ISIN].unrealizedProfitAndLoss = holdingMap[holding.ISIN].currentValue - holdingMap[holding.ISIN].invested;
				holdingMap[holding.ISIN].unrealizedProfitAndLossPercent = (holdingMap[holding.ISIN].unrealizedProfitAndLoss / holdingMap[holding.ISIN].invested) * 100;
			});
		});

		setOverallHoldings(Object.values(holdingMap).sort((a, b) => {
			return a.sector?.localeCompare(b.sector || '') || 0
		}));
	}

	
	const addAccountAndUpdateState = (account: IAccount)  => {
		const updatedAccounts = [...accounts, account]
		setAccounts(updatedAccounts)

		localStorage.setItem('accounts', JSON.stringify(updatedAccounts))

		updateOverallHoldings(updatedAccounts);
	}

	const removeAccountAndUpdateState = (accountName: string)  => {
		const updatedAccounts = accounts.filter((account) => account.accountName !== accountName)
		setAccounts(updatedAccounts)

		localStorage.setItem('accounts', JSON.stringify(updatedAccounts))
		
		updateOverallHoldings(updatedAccounts);
	}

	return (
		<FolioContext.Provider value={{ 
			accounts, 
			overallHoldings, 
			setAccounts, 
			setOverallHoldings, 
			addAccountAndUpdateState,
			removeAccountAndUpdateState
		}}>
			<div className='folio-page'>
				<nav>
					<div className="nav-wrapper">
						<div className="left">
							<h1 className='logo'>Dematfolio</h1>
						</div>
						<div className="right">
							<Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
								<Button
									startDecorator={<Add />}
									onClick={() => setOpen(true)}
								>Add Holdings</Button>
							</Box>
						</div>
					</div>
				</nav>
				<MainContainer />
				<ExcelModel open={open} setOpen={setOpen} />
			</div>
		</FolioContext.Provider>
	)
}

function ExcelModel({ open, setOpen }: {
	open: boolean,
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
}) {
	return <Modal
		aria-labelledby="modal-title"
		aria-describedby="modal-desc"
		open={open}
		onClose={() => setOpen(false)}
		sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
	>
		<Sheet
			variant="outlined"
			sx={{
				minWidth: 300,
				borderRadius: 'md',
				p: 3,
			}}
		>
			<ModalClose variant="plain" sx={{ m: 1 }} />
			<Excel />
		</Sheet>
	</Modal>;
}

function MainContainer() {
	return (
		<section className='main-container'>
			<Analytics />
			<OverallHoldings />
		</section>
	)
}