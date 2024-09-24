import React, { useState, useEffect,useMemo,useCallback } from "react";
import fetch from './api/dataService';
import "./App.css";
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import "ag-grid-community/styles/ag-grid.css"; // Mandatory CSS required by the Data Grid
import "ag-grid-community/styles/ag-theme-quartz.css"; // Optional Theme applied to the Data Grid

function calculateResults(incomingData) {
  // Calculate points per transaction
  //Add memoization for calculation.

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const pointsPerTransaction = incomingData.map(transaction=> {
    let points = 0;
    let over100 = transaction.amt - 100;
    
    if (over100 > 0) {
      // A customer receives 2 points for every dollar spent over $100 in each transaction      
      points += (over100 * 2);
    }    
    if (transaction.amt > 50) {
      // plus 1 point for every dollar spent over $50 in each transaction
      points += 50;      
    }
    const month = new Date(transaction.transactionDt).getMonth();
    transaction=>React.useMemo(()=>{return transaction})
    return {...transaction, points, month};
  });

               
  let byCustomer = {};
  let totalPointsByCustomer = {};
  pointsPerTransaction.forEach(pointsPerTransaction => {
    let {custid, name, month, points} = pointsPerTransaction;   
    if (!byCustomer[custid]) {
      byCustomer[custid] = [];      
    }    
    if (!totalPointsByCustomer[custid]) {
      totalPointsByCustomer[name] = 0;
    }
    totalPointsByCustomer[name] += points;
    if (byCustomer[custid][month]) {
      byCustomer[custid][month].points += points;
      byCustomer[custid][month].monthNumber = month;
      byCustomer[custid][month].numTransactions++;      
    }
    else {
      
      byCustomer[custid][month] = {
        custid,
        name,
        monthNumber:month,
        month: months[month],
        numTransactions: 1,        
        points
      }
    }    
  });
  let tot = [];
  for (var custKey in byCustomer) {    
    byCustomer[custKey].forEach(cRow=> {
      tot.push(cRow);
    });    
  }
  //console.log("byCustomer", byCustomer);
  //console.log("tot", tot);
  let totByCustomer = [];
  for (custKey in totalPointsByCustomer) {    
    totByCustomer.push({
      name: custKey,
      points: totalPointsByCustomer[custKey]
    });    
  }
  return {
    summaryByCustomer: tot,
    pointsPerTransaction,
    totalPointsByCustomer:totByCustomer
  };
}

function App() {
  const [transactionData, setTransactionData] = useState(null);
  
  const columns = [
    {
      Header:'Customer',
      field: 'name'      
    },    
    {
      Header:'Month',
      field: 'month'
    },
    {
      Header: "# of Transactions",
      field: 'numTransactions'
    },
    {
      Header:'Reward Points',
      field: 'points'
    }
  ];
  const totalsByColumns = [
    {
      Header:'Customer',
      field: 'name'      
    },    
    {
      Header:'Points',
      field: 'points'
    }
  ]

  

  useEffect(() => { 
    fetch().then((data)=> {             
      const results = calculateResults(data);      
      setTransactionData(results);   //update this.state
    });
  },[]);

  return transactionData == null ?
    <div>Loading...</div> 
      :    
      <div>
          <div className="row">
          <div className="col-10">
            <h2>Points Rewards System Totals by Customer Months</h2>
          </div>
        </div>
    <div style={{ height: 200 }}className={"ag-theme-alpine"}>      
      <AgGridReact
      columnDefs={columns}
      rowData={transactionData.summaryByCustomer}
      
      />
      </div>
      <div className="row">
            <div className="col-10">
              <h2>Points Rewards System Totals By Customer</h2>
            </div>
          </div>   
      <div style={{ height: 100 }}className={"ag-theme-alpine"}>      
      <AgGridReact
      columnDefs={totalsByColumns}
      rowData={transactionData.totalPointsByCustomer}
      />
      </div>
    </div>
  ;
}

export default App;
