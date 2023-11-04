import './OverallHoldings.css'

import React, { useContext } from 'react';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemContent from '@mui/joy/ListItemContent';
import Typography from '@mui/joy/Typography';
import { Container } from '@mui/system';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import ChipDelete from '@mui/joy/ChipDelete';

import { FolioContext } from '../pages/Folio'

const currencyDisplayFormat = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 })

export function OverallHoldings() {
	const { accounts, overallHoldings, removeAccountAndUpdateState } = useContext(FolioContext)
	
	return (
		<Container maxWidth="md">
			<Box sx={{ display: 'flex', gap: 1 }} mb={2}>
				{accounts.map(account => (
					<Chip
						key={account.accountName}
						endDecorator={<ChipDelete onDelete={() => removeAccountAndUpdateState && removeAccountAndUpdateState(account.accountName)} />}
					>
						{account.accountName}
					</Chip>
				))}
			</Box>
			{!!overallHoldings.length && (
				<List size="sm" sx={{ maxWidth: 'md', gap: 2, justifySelf: 'center' }}>
					{overallHoldings.map((holding) => (
						<React.Fragment key={holding.symbol}>
							<ListItem variant='outlined' 
								sx={{ 
									borderRadius: 'sm',
									backgroundColor: holding.unrealizedProfitAndLossPercent > 0 ? 'success.100' : 'danger.100'
								}}
							>
								<ListItemContent>
									<Typography 
										level='title-sm' 
										sx={{ 
											width: '400px', 
											textWrap: 'nowrap', 
											overflow: 'hidden',
											textOverflow: 'ellipsis'
										}}
										// textColor={holding.unrealizedProfitAndLossPercent > 0 ? 'success.400' : 'danger.400'}
									>
										{holding.symbol}{" "}
										<Typography level="body-xs">
											{currencyDisplayFormat.format(holding.unrealizedProfitAndLoss)}
											{" "}({holding.unrealizedProfitAndLossPercent})
										</Typography>
									</Typography>
									<Typography level="body-sm">{holding.sector}</Typography>
								</ListItemContent>
								<ListItemContent sx={{ textAlign: 'right' }}>
									<Typography level="body-lg">
										<Typography level="body-xs">{holding.quantity} x {currencyDisplayFormat.format(holding.averageBuyPrice)} = </Typography>
										<Typography level="body-md">{currencyDisplayFormat.format(holding.invested)}</Typography>
									</Typography>
									<Typography level="body-lg">
										<Typography level="body-xs">{holding.quantity} x {currencyDisplayFormat.format(holding.currentMarketPrice)} = </Typography>
										<Typography level="body-md">{currencyDisplayFormat.format(holding.currentValue)}</Typography>
									</Typography>
								</ListItemContent>
							</ListItem>
						</React.Fragment>
					))}
				</List>
			)}
		</Container>
	)
}