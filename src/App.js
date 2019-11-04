import React, { Component } from 'react'
import axios from 'axios'
import * as moment from 'moment'
import { Spinner } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import './style.css'
import {APIKey} from './env.js'

const DAY_RANGE = 3
let last = 0, timer = null

export class App extends Component {
  constructor(props){
    super(props)

    this.state = {
      images: [],
      currentNum: 0,
      loading: false
    }
    this.throttle = this.throttle.bind(this)
    this.loadImgs = this.loadImgs.bind(this)
  }

  componentDidMount(){
    this.throttle(1000, this.loadImgs)
    window.addEventListener('scroll', (this.handleScroll).bind(this))
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  loadImgs(){
    let promises = []
    this.setState({loading: true}, () => {
      for(let i=this.state.currentNum;i<this.state.currentNum+DAY_RANGE;i++){
        let d = moment().subtract(i, "days").format('YYYY-MM-DD')
        const promise = axios.get(`https://api.nasa.gov/planetary/apod?api_key=${APIKey}&date=${d}`)
        promises.push(promise)
      }
      Promise.all(promises).then((results) => {
        let resultImgs = results.map(res => [res.data.url, res.data.title, res.data.explanation])
        setTimeout(() => {
          this.setState({
            images: [
              ...this.state.images, ...resultImgs
            ],
            loading:    false,
            currentNum: this.state.currentNum+DAY_RANGE
          })
        }, 500)
      }).catch((error) => {
        console.log(error)
      })
    })
  }

  throttle(delay, fn){
    return new Promise(resolve => {
      let now = new Date()
      if(now - last >= delay){
        // 如果时间间隔小于我们设定的时间间隔阈值，则为本次触发操作设立一个新的定时器  
        clearTimeout(timer)  
        timer = setTimeout(() => {  
          last = now
          fn()
        }, delay)  
      }else{
        // 如果时间间隔超出了我们设定的时间间隔阈值，那就不等了，无论如何要反馈给用户一次响应  
        last = now
        fn()
      }
      resolve()
    })
  }

  handleScroll(e){
    if(document.documentElement.offsetHeight - document.documentElement.scrollTop - window.innerHeight < 500 && !this.state.loading){
      this.throttle(1000, this.loadImgs)
    }
  }

  showImgs(){
    return this.state.images.map(img => {
      return(
        <div key={img[0]} className="row top-buffer">
          <img className="col" src={img[0]} alt={img[2]}/>
        </div>
      )
    })
  }

  render() {
    return (
      <div className="container">
        {this.showImgs()}
        <div className="d-flex justify-content-center align-item-center loader-wraper">
          <Spinner animation="border" variant="light" role="status" style={{display: this.state.loading ? 'block' : 'none'}}>
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      </div>
    )
  }
}

export default App