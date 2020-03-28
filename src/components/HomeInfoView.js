import React, {useState, useEffect} from 'react'
import {Pie, StackedBar} from 'react-roughviz'
import formatDistanceStrict from 'date-fns/formatDistanceStrict'
import format from 'date-fns/format'

const start = new Date(2020, 2, 27)
const end = new Date(start.getTime() + 21 * 24 * 60 * 60 * 1000)
const totalMillis = end.getTime() - start.getTime()

const DailyHistogram = () => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const update = () => {
      window.fetch('https://pomber.github.io/covid19/timeseries.json').then(res => {
        res.json().then(data => {
          setData(data)
        })
      }, err => alert('Unable to fetch data, please refresh to try again'))
    }
    update()
    const interval = setInterval(update, 30 /* minutes */ * 60 * 1000);
    return () => clearInterval(interval)
  }, [])

  if (!data) {
    return <p>Loading...</p>
  }
  const from = new Date(2020, 2, 4)
  const dateStringToDate = d => {
    const parts = d.split('-')
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  }
  const countryData = data['South Africa'].map(({ date, ...props }) => ({ day: dateStringToDate(date), ...props }))
  .filter(d => d.day > from)
  return <>
    <StackedBar
      data={countryData.map(({ day, confirmed, deaths, recovered }) => ({
        day: format(day, 'MMM dd'),
        active: confirmed - deaths - recovered,
      }))}
      labels='day'
      title='The Curve'
      width={window.innerWidth * .8}
      fillStyle='cross-hatch'
      colors={['orange', 'orange']}
    />
    <p>The Curve shows the active cases of covid-19 in South Africa, (confirmed minus deaths minus recovered), see also <a href="https://github.com/pomber/covid19">the data source</a>.</p>
  </>
}

export default () => {
  const [passedMillis, setPassedMillis] = useState(0)
  const [toGoMillis, setToGoMillis] = useState(0)
  const [timeToGo, setTimeToGo] = useState('')
  const [secondsDone, setSecondsDone] = useState(0)

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setPassedMillis(now.getTime() - start.getTime())
      setToGoMillis(end.getTime() - now.getTime())
      setTimeToGo(formatDistanceStrict(now, end))
      setSecondsDone(formatDistanceStrict(start, now, { unit: 'second' }))
    }
    update()
    const i = setInterval(update, 2 * 1000)
    return () => clearInterval(i)
  }, [])

  const done = toGoMillis < 0
  const percentDone = Math.round((passedMillis / totalMillis) * 10000) / 100
  const percentDoneLabel = `${percentDone}%`
  const percentTodoLabel = `${100 - percentDone}%`
  
  return (
    <>
      <section  className='timer-section' style={{ width: '100%', fontFamily: 'gaeguregular' }}>
        {done && <div className="done">We are done!</div>}
        <div style={{ width: '100%', padding: 20, display: 'flex', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            {percentDone > 0.01 && (
              <div style={{ transform: 'scale(1)' }}>
                <Pie
                  data={{
                    labels: [`${percentTodoLabel} TODO`, `${percentDoneLabel} Done`],
                    values: [Math.max(0.001, 100 - percentDone), percentDone],
                  }}
                  title="Lockdown Progress"
                  colors={['orange', 'green']}
                  roughness={2}
                  strokeWidth={2}
                />
              </div>
            )}
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 24, marginBottom: 20 }}>
                {secondsDone} done, {timeToGo} to go...
              </div>
              <div style={{ fontSize: 24, marginBottom: 20 }}>
                Stay at home to keep the curve low! 
              </div>
              <div style={{ fontSize: 24 }}>
                More info: <a href="https://sacoronavirus.co.za/">sacoronavirus.co.za</a>
              </div>
            </div>
            <DailyHistogram />
          </div>
        </div>
      </section>
    </>
  )
}
