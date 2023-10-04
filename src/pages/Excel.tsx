import { read, utils } from "xlsx";

export function Excel() {

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		console.log('e -->', event);
		console.log('event.target.files -->', event.target.files);

		if (!event.target.files) return

		const reader = new FileReader();

		reader.onload = (loadEvent) => {
			const buffer = loadEvent.target?.result;
			console.log('buffer -->', buffer);
			let workbook = read(buffer)
			console.log('workbook -->', workbook);
			// const sheetJson = utils.sheet_to_json(workbook.Sheets['Combined'])
			const sheetJson = utils.sheet_to_json(workbook.Sheets['Combined'], { range: 23, header: [
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
				"unrealizePnLPct"
			] })
			console.log('sheetJson -->', sheetJson);
		};

		reader.readAsArrayBuffer(event.target.files[0]);
	}
	

	return (
		<div>
			<h1>Excel</h1>

			<input type="file" onChange={handleChange} />
			<button>Submit</button>
		</div>
	)
}