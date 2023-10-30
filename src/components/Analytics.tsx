import './Analytics.css'
import React, { useContext, useState } from 'react';
import { FolioContext } from '../pages/Folio';
import { Container } from '@mui/system';
import Typography from '@mui/joy/Typography';
import { Chart } from "react-google-charts";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

const chartTypes = {
	"investmentsBySector": "Investments by Sector",
	"unrealizedProfitAndLoss": "Unrealized Profit And Loss",
	"unrealizedProfitAndLossByPercentage": "Unrealized Profit And Loss By Percentage",
	"investedVsCurrent": "Total Invested vs Current Value"
}

type chartTypeKeys = keyof typeof chartTypes

export function Analytics() {
	const { overallHoldings, accounts } = useContext(FolioContext)
	const [chartType, setChartType] = useState<chartTypeKeys>('investmentsBySector')

	const handleChartChange = (e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | React.FocusEvent<Element, Element> | null, value: string | null) => {
		if (!value) return
		console.log('e -->', e);
		setChartType(value as chartTypeKeys)
	}

	let stats = {
		totalInvested: 0
	}

	const currencyDisplayFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

	console.log('overallHoldings -->', overallHoldings);

	accounts.forEach(account => {
		stats.totalInvested += account.totalInvested
	})

	const sectorInvestedGroup: { [key: string]: number } = {}
	overallHoldings.forEach(holding => {
		if (!holding.sector) return
		if(!sectorInvestedGroup.hasOwnProperty(holding.sector)) {
			sectorInvestedGroup[holding.sector || ''] = holding.invested
			return
		}
		sectorInvestedGroup[holding.sector || ''] += holding.invested
	})

	const sectorInvestedGroupPieChartData = [
		["Sector", "Value"],
		...Object.entries(sectorInvestedGroup).sort((a,b) => b[1] - a[1])
	]

	const profitAndLoss: [string, number][] = []
	overallHoldings.forEach(holding => {
		profitAndLoss.push([holding.symbol, holding.unrealizedProfitAndLoss])
	})

	const profitAndLossChartData = [
		["Symbol", "ProfitAndLoss"],
		...profitAndLoss.sort((a,b) => b[1] - a[1])
	]
	
	const profitAndLossPercentage: [string, number][] = []
	overallHoldings.forEach(holding => {
		profitAndLossPercentage.push([holding.symbol, holding.unrealizedProfitAndLossPercent])
	})

	const profitAndLossPercentageChartData = [
		["Symbol", "ProfitAndLossByPercentage"],
		...profitAndLossPercentage.sort((a,b) => b[1] - a[1])
	]

	console.log('profitAndLossPercentagePieChartData -->', profitAndLossPercentageChartData);

	const investedVsCurrent: [string, number, number][] = []
	overallHoldings.forEach(holding => {
		investedVsCurrent.push([holding.symbol, holding.invested, holding.currentValue])
	})

	const investedVsCurrentChartData = [
		["Symbol", "Invested", "Current Value"],
		...investedVsCurrent.sort((a,b) => b[1] - a[1])
	]


	
	return (
		<>
			<Container maxWidth='md' sx={{marginTop: 4}}>
				<Typography level="h3" mb={2}>Total Invested: {currencyDisplayFormat.format(stats.totalInvested)}</Typography>
				<Select defaultValue="investmentsBySector" onChange={handleChartChange} sx={{ width: 300 }}>
					{Object.entries(chartTypes).map(([value, displayText]) => (
						<Option key={value} value={value}>{displayText}</Option>
					))}
				</Select>
			</Container>
			<Container maxWidth={false} sx={{marginTop: 4}}>
				{ chartType === 'investmentsBySector' ? (
						<Chart 
							chartType="PieChart"
							data={sectorInvestedGroupPieChartData} 
							width={"100%"}
							height={"90vh"}
						/>
					) : chartType === 'unrealizedProfitAndLoss' ? (
						<Chart 
							chartType="BarChart"
							data={profitAndLossChartData} 
							options={{
								bars: "horizontal",
								legend: {
									position: "bottom"
								},
								vAxis: {
									textStyle: {
										fontSize: 9
									},
								},
								tooltip: {
									textStyle: {
										fontSize: 12
									}
								}
							}}
							width={"100%"}
							height={"90vh"}
						/>
				) : chartType === 'unrealizedProfitAndLossByPercentage' ? (
						<Chart 
							chartType="BarChart"
							data={profitAndLossPercentageChartData} 
							options={{
								bars: "horizontal",
								legend: {
									position: "bottom"
								},
								vAxis: {
									textStyle: {
										fontSize: 9
									},
								},
								tooltip: {
									textStyle: {
										fontSize: 12
									}
								}
							}}
							width={"100%"}
							height={"90vh"}
						/>
					) : (
						<Chart 
							chartType="BarChart"
							data={investedVsCurrentChartData} 
							options={{
								bars: "horizontal",
								legend: {
									position: "bottom"
								},
								vAxis: {
									textStyle: {
										fontSize: 9
									},
								},
								tooltip: {
									textStyle: {
										fontSize: 12
									}
								}
							}}
							width={"100%"}
							height={"90vh"}
						/>
					)
				}
			</Container>
		</>
	)
}

