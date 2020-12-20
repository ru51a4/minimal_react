import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style.less';
import Profile from "../profile";

export default class Header extends Component {
	state = {
		count: 0,
	};
	 items = []

	componentDidMount() {

		for (let i=0; i <= 10000; i++) {
			this.items.push(<Profile />)
		}
	}
	render() {
		return (
			<header>
				counter {this.state.count}
				<button onClick={()=>{
					// start
					var time = +(new Date);
					this.setState({ count: this.state.count+1 });
					var total = +(new Date) - time;
					console.log({total});
				}}>plus</button>
				{this.items.map((value, index) => {
					return value;
				})}
			</header>
		);
	}
}



