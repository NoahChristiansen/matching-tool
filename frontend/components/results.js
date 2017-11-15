import ContentAdd from 'material-ui/svg-icons/content/add'
import DatePicker from 'material-ui/DatePicker'
import Drawer from 'material-ui/Drawer'
import DurationBarChart from './bar'
import FloatingActionButton from 'material-ui/FloatingActionButton'
import Header from './header'
import MenuItem from 'material-ui/MenuItem'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import RaisedButton from 'material-ui/RaisedButton'
import React from 'react'
import SelectField from 'material-ui/SelectField'
import TableList from './table'
import Venn from './venn'
import { connect } from 'react-redux'
import { getMatchingResults, updateControlledDate, updateDuration } from '../actions'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'

const styles = {
  hr: {
    clear: "both",
    margin: 0
  },
  h4: {
    "text-align": "left",
    float:"left",
    "margin-top": 6,
    marginLeft: 60,
  },
  h5: {
    "text-align": "right",
    float:"right",
    marginRight: 7
  },
  page: {
    margin: '5px',
    'font-family': 'Roboto, sans-serif',
  },
  container: {
    display: 'flex',
    'justify-content': 'space-between',
  },
  datepicker: {
    marginLeft: 15,
  },
  panel: {
    width: '100%',
    marginLeft: 5
  },
  card: {
    width: '50%',
    expanded: true,
  },
  card_close: {
    width: '100%',
    expanded: true,
    marginLeft: 60,
    marginRight: 7
  },
  bar_chart_jail: {
    width: '50%',
    marginLeft: 60,
  },
  bar_chart_homeless: {
    width: '50%',
    marginRight: 7
  },
  button: {
    margin: '12',
  },
  floatingActionButtonAdd: {
    position: 'absolute',
    top: '50%',
    marginLeft: 5
  },
  floatingActionButtonClose: {
    position: 'absolute',
    top: '2%',
    marginLeft: '85%'
  },
}

function mapStateToProps(state) {
  return {
    matchingResults: state.app.matchingResults,
    controlledDate: state.app.matchingResults.filters.controlledDate,
    duration: state.app.matchingResults.filters.duration
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateMatchingResults: (data) => {
      dispatch(getMatchingResults(data))
    },
    handleControlledDate: (event, date) => {
      dispatch(updateControlledDate(date))
    },
    handleDurationChange: (event, index, value) => {
      dispatch(updateDuration(value))
    }
  }
}

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
    }
  }

  handleToggle = () => {
    this.setState({
      open: !this.state.open
    })
  }

  handleClose = () => {
    this.setState({
      open: false
    })
  }

  componentDidMount() {
    this.props.updateMatchingResults(matching_results)
  }

  render() {
    const contentStyle = {  transition: 'margin-left 300ms cubic-bezier(0.23, 1, 0.32, 1)' }
    if (this.state.open) {
      contentStyle.marginLeft = '25%'
    }
    return (
      <div>
        <Header location={this.props.location} />
        <div style={styles.page}>
          <FloatingActionButton
            style={styles.floatingActionButtonAdd}
            mini={true}
            onClick={this.handleToggle} >
            <ContentAdd />
          </FloatingActionButton>
          <Drawer
            docked={true}
            width={'25%'}
            open={this.state.open}
            containerStyle={{height: 'calc(100% - 48px)', top: 48}}
            onRequestChange={(open) => this.setState({open})} >
            <div style={styles.container}>
              <Card style={styles.panel}>
                <CardTitle title="Control Panel" titleStyle={{'font-size': 20}} />
                <FloatingActionButton
                  onClick={this.handleClose}
                  mini={true}
                  secondary={true}
                  style={styles.floatingActionButtonClose} >
                  <NavigationClose />
                </FloatingActionButton>
                <div style={styles.datepicker}>
                  <h5>End Date:
                    <DatePicker
                      hintText="Pick the data to go back"
                      value={this.props.controlledDate}
                      onChange={this.props.handleControlledDate} />
                  </h5>
                  <h5>Duration:</h5>
                  <h5>
                    <SelectField
                      value={this.props.duration}
                      onChange={this.props.handleDurationChange}
                      maxHeight={200} >
                      <MenuItem value={30} key={1} primaryText={`1 Month`} />
                      <MenuItem value={90} key={2} primaryText={`3 Months`} />
                      <MenuItem value={365} key={3} primaryText={`1 Year`} />
                    </SelectField>
                  </h5>
                </div>
                <Venn data={this.props.matchingResults.vennDiagramData} />
              </Card>
            </div>
            <RaisedButton label="Download List" secondary={true} style={styles.button} />
            <RaisedButton label="Download Charts" secondary={true} style={styles.button} />
          </Drawer>
        </div>
        <div style={contentStyle}>
          <div>
            <h4 style={styles.h4}>Results - 7/1/2017 through 7/31/2017</h4>
            <h5 style={styles.h5}>
                Total: <strong>740</strong>&nbsp;
                Jail: <strong>500</strong>&nbsp;
                Homeless: <strong>340</strong>&nbsp;
                Intersection: <strong>100</strong>&nbsp;
            </h5>
            <hr style={styles.hr}/>
          </div>
          <div style={styles.container}>
            <Card style={styles.card_close}>
              <TableList data={this.props.matchingResults.filteredData.tableData} />
            </Card>
          </div>
          <div style={styles.container}>
            <Card style={styles.bar_chart_jail}>
              <CardTitle title="Jail Duration Bar Chart" titleStyle={{'font-size': 20}} />
                <DurationBarChart data={this.props.matchingResults.filteredData.jailBarData} />
            </Card>
            <Card style={styles.bar_chart_homeless}>
              <CardTitle title="Homeless Duration Bar Chart" titleStyle={{'font-size': 20}} />
                <DurationBarChart data={this.props.matchingResults.filteredData.homelessBarData} />
            </Card>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Results)


const venn_diagram_data = [ {sets: ['Jail'], size: 500}, {sets: ['Homeless'], size: 340}, {sets: ['Jail','Homeless'], size: 100}]

const jail_bar_data = [
  [{x: 'Jail', y: 40}, {x: 'Jail & Homeless', y: 30}],
  [{x: 'Jail', y: 20}, {x: 'Jail & Homeless', y: 30}],
  [{x: 'Jail', y: 30}, {x: 'Jail & Homeless', y: 20}],
  [{x: 'Jail', y: 5}, {x: 'Jail & Homeless', y: 10}],
  [{x: 'Jail', y: 5}, {x: 'Jail & Homeless', y: 10}],
]

const homeless_bar_data = [
  [{x: 'Homeless', y: 20}, {x: 'Jail & Homeless', y: 30}],
  [{x: 'Homeless', y: 15}, {x: 'Jail & Homeless', y: 25}],
  [{x: 'Homeless', y: 25}, {x: 'Jail & Homeless', y: 20}],
  [{x: 'Homeless', y: 30}, {x: 'Jail & Homeless', y: 15}],
  [{x: 'Homeless', y: 10}, {x: 'Jail & Homeless', y: 10}],
]

const table_data = [
  { ID: 12319,
    Name: 'Roy Batty',
    Source: ['Jail', 'Homeless'],
    'Total Contacts': 5,
    'Jail Days': 8,
    'Jail Contacts': 3,
    'Homeless Days': 2,
    'Homeless Contacts': 2,
    'Last Jail Contact': '1982-06-25',
    'Last Homeless Contact': '1981-06-25' },
  { ID: 17144,
    Name: 'James Moriarty',
    Source: ['Jail', 'Homeless'],
    'Total Contacts': 8,
    'Jail Days': 16,
    'Jail Contacts': 5,
    'Homeless Days': 2,
    'Homeless Contacts': 3,
    'Last Jail Contact': '2017-08-21',
    'Last Homeless Contact': '1982-06-25' },
  { ID: 12432,
    Name: 'Jason Smith',
    Source: 'Homeless',
    'Total Contacts': 1,
    'Jail Days': 0,
    'Jail Contacts': 0,
    'Homeless Days': 1,
    'Homeless Contacts': 2,
    'Last Jail Contact': null,
    'Last Homeless Contact': '2017-07-25' },
  { ID: 19332,
    Name: 'H. H. Holmes',
    Source: 'Jail',
    'Total Contacts': 1,
    'Jail Days': 241,
    'Jail Contacts': 1,
    'Homeless Days': 0,
    'Homeless Contacts': 0,
    'Last Jail Contact': '1894-11-17',
    'Last Homeless Contact': null },
  { ID: 19032,
    Name: 'Jack Ripper',
    Source: 'Jail',
    'Total Contacts': 2,
    'Jail Days': 102,
    'Jail Contacts': 2,
    'Homeless Days': 0,
    'Homeless Contacts': 0,
    'Last Jail Contact': '1891-10-17',
    'Last Homeless Contact': null },
  { ID: 12143,
    Name: 'Lee Salminen',
    Source: 'Homeless',
    'Total Contacts': 5,
    'Jail Days': 0,
    'Jail Contacts': 0,
    'Homeless Days': 43,
    'Homeless Contacts': 5,
    'Last Jail Contact': null,
    'Last Homeless Contact': '2017-09-25' },
  { ID: 12833,
    Name: 'John Doe',
    Source: ['Jail', 'Homeless'],
    'Total Contacts': 3,
    'Jail Days': 2,
    'Jail Contacts': 1,
    'Homeless Days': 8,
    'Homeless Contacts': 2,
    'Last Jail Contact': '2017-05-17',
    'Last Homeless Contact': '2016-04-25' },
  { ID: 13833,
    Name: 'Jane Doe',
    Source: 'Homeless',
    'Total Contacts': 2,
    'Jail Days': 0,
    'Jail Contacts': 0,
    'Homeless Days': 2,
    'Homeless Contacts': 2,
    'Last Jail Contact': null,
    'Last Homeless Contact': '2017-10-03' },
  { ID: 13932,
    Name: 'Evan Jackson',
    Source: ['Jail', 'Homeless'],
    'Total Contacts': 2,
    'Jail Days': 1,
    'Jail Contacts': 1,
    'Homeless Days': 4,
    'Homeless Contacts': 1,
    'Last Jail Contact': '2017-09-11',
    'Last Homeless Contact': '2013-02-19' },
  { ID: 19982,
    Name: 'Liam Smith',
    Source: 'Homeless',
    'Total Contacts': 3,
    'Jail Days': 0,
    'Jail Contacts': 0,
    'Homeless Days': 7,
    'Homeless Contacts': 3,
    'Last Jail Contact': null,
    'Last Homeless Contact': '2011-04-15' },
  { ID: 19932,
    Name: 'Griffin Smith',
    Source: 'Homeless',
    'Total Contacts': 2,
    'Jail Days': 0,
    'Jail Contacts': 0,
    'Homeless Days': 3,
    'Homeless Contacts': 2,
    'Last Jail Contact': null,
    'Last Homeless Contact': '2017-08-19' },
]

const matching_results = {
  filters: {
    controlledDate: '2017-07-01',
    duration: '1 year',
    serviceProviders: ['jail', 'hmis', 'intersection']
  },
  vennDiagramData: venn_diagram_data,
  filteredData: {
    tableData: table_data,
    jailBarData: jail_bar_data,
    homelessBarData: homeless_bar_data,
  },
}