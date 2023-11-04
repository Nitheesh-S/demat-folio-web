import './Analytics.css'
import React, { useContext, useState } from 'react';
import { FolioContext } from '../pages/Folio';
import { Container } from '@mui/system';
import Typography from '@mui/joy/Typography';
import { Chart } from "react-google-charts";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import { IOverallHolding } from '../types/Folio';

const chartTypes = {
	"investmentsBySector": "Investments by Sector",
	"unrealizedProfitAndLoss": "Unrealized Profit And Loss",
	"unrealizedProfitAndLossByPercentage": "Unrealized Profit And Loss By Percentage",
	"investedVsCurrent": "Total Invested vs Current Value"
}

type chartTypeKeys = keyof typeof chartTypes

const getInvestedVsCurrentChartData = (overallHoldings: IOverallHolding[]) => {
	const investedVsCurrent: [string, number, number][] = []

	overallHoldings.forEach(holding => {
		investedVsCurrent.push([holding.symbol, holding.invested, holding.currentValue])
	})

	return [
		["Symbol", "Invested", "Current Value"],
		...investedVsCurrent.sort((a,b) => b[1] - a[1])
	]
}

const getProfitAndLossPercentageChartData = (overallHoldings: IOverallHolding[]) => {
	const profitAndLossPercentage: [string, number][] = []

	overallHoldings.forEach(holding => {
		profitAndLossPercentage.push([holding.symbol, holding.unrealizedProfitAndLossPercent])
	})

	return [
		["Symbol", "ProfitAndLossByPercentage"],
		...profitAndLossPercentage.sort((a,b) => b[1] - a[1])
	]
}

const getProfitAndLossChartData = (overallHoldings: IOverallHolding[]) => {
	const profitAndLoss: [string, number][] = []

	overallHoldings.forEach(holding => {
		profitAndLoss.push([holding.symbol, holding.unrealizedProfitAndLoss])
	})

	return [
		["Symbol", "ProfitAndLoss"],
		...profitAndLoss.sort((a,b) => b[1] - a[1])
	]
}

const getSectorInvestedGroupPieChartData = (overallHoldings: IOverallHolding[]) => {
	const sectorInvestedGroup: { [key: string]: number } = {}
	overallHoldings.forEach(holding => {
		if (!holding.sector) return
		if(!sectorInvestedGroup.hasOwnProperty(holding.sector)) {
			sectorInvestedGroup[holding.sector || ''] = holding.invested
			return
		}
		sectorInvestedGroup[holding.sector || ''] += holding.invested
	})

	return [
		["Sector", "Value"],
		...Object.entries(sectorInvestedGroup).sort((a,b) => b[1] - a[1])
	]
}

const currencyDisplayFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })


export function Analytics() {
	const { overallHoldings, accounts } = useContext(FolioContext)
	const [chartType, setChartType] = useState<chartTypeKeys>('investmentsBySector')

	const handleChartChange = (e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | React.FocusEvent<Element, Element> | null, value: string | null) => {
		if (!value) return
		console.log('e -->', e);
		setChartType(value as chartTypeKeys)
	}

	let stats = {
		totalInvested: 0,
		currentValue: 0
	}

	console.log('overallHoldings -->', overallHoldings);

	overallHoldings.forEach(holding => {
		stats.totalInvested += holding.invested
		stats.currentValue += holding.currentValue
	})

	
	const sectorInvestedGroupPieChartData = getSectorInvestedGroupPieChartData(overallHoldings)
	
	const profitAndLossChartData = getProfitAndLossChartData(overallHoldings)
	
	const profitAndLossPercentageChartData = getProfitAndLossPercentageChartData(overallHoldings) 

	const investedVsCurrentChartData = getInvestedVsCurrentChartData(overallHoldings)
	
	const barChartOptions = {
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
		},
		chartArea: {
			width: '1200px',
			height: '80%',
		}
	};

	return (
		<>
			<Container maxWidth='md' sx={{marginTop: 4}}>
				<Typography level="h3" mb={2}>Total Invested: {currencyDisplayFormat.format(stats.totalInvested)}</Typography>
				<Typography level="h3" mb={2}>Current Value: {currencyDisplayFormat.format(stats.currentValue)}</Typography>
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
							options={{
								chartArea: {
									width: '1200px',
									height: '90%',
								}
							}}
							width={"100%"}
							height={"500px"}
						/>
					) : chartType === 'unrealizedProfitAndLoss' ? (
						<Chart 
							chartType="BarChart"
							data={profitAndLossChartData} 
							options={barChartOptions}
							width={"100%"}
							height={"500px"}
						/>
				) : chartType === 'unrealizedProfitAndLossByPercentage' ? (
						<Chart 
							chartType="BarChart"
							data={profitAndLossPercentageChartData} 
							options={barChartOptions}
							width={"100%"}
							height={"500px"}
						/>
					) : (
						<Chart 
							chartType="BarChart"
							data={investedVsCurrentChartData} 
							options={barChartOptions}
							width={"100%"}
							height={"500px"}
						/>
					)
				}
			</Container>
		</>
	)
}

