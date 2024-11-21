import logo from './logo.svg';
import './App.css';
import { useSession,useSupabaseClient ,useSessionContext} from '@supabase/auth-helpers-react';
import DateTimePicker from 'react-datetime-picker';
import { useState } from 'react';
import 'react-datetime-picker/dist/DateTimePicker.css';
function App() {
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [eventName, setEventName] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  const session =useSession();// tokens
  const supabase = useSupabaseClient(); // just talk to supabase
  const {isLoading}=useSessionContext();

  if(isLoading){
    return <></>
  }
  async function googleSignIn() {
    const { error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:{
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if(error){
      alert("Error Logging in to Google");
      console.log(error);
    }   
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  async function createCalendarEvent() {
    console.log("Created Calendar Event");
    const event={
      'summary' : eventName,
      'description': eventDescription,
      'start' : {
        'dateTime': start.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end' : {
        'dateTime': end.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }
    await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events",{
      method: "POST",
      headers:{
        'Authorization':'Bearer ' + session.provider_token // Access token for google
      },
      body: JSON.stringify(event)
    }).then((data)=>{
      return data.json();
    }).then((data)=>{
      console.log(data);
      alert("Event created, Check your Google Calendar");
    })
  }

  console.log(session);
  console.log(start);
  console.log(eventName);
  console.log(eventDescription);
  return (
    <div className="App">
      <div className='mainDiv'>
        {session ?
        <>
        <h3>Welcome, {session.user.email}! Let’s Create Your Event!</h3>
        <p>Start of your event</p>
        <DateTimePicker onChange={setStart} value={start} className="DateTimePicker"/>
        <p>End of your event</p>
        <DateTimePicker onChange={setEnd} value={end} className="DateTimePicker"/>
        <p>Event Name</p>
        <input type='text' onChange={(e)=> setEventName(e.target.value)} className='inputSection'/>
        <p>Event Description</p>
        <input type='text' onChange={(e)=> setEventDescription(e.target.value)} className='inputSection' />
        <hr />
        <button onClick={()=> createCalendarEvent()} className='Create-calendar'>Create Calendar Event</button>
        <p></p>
        <button onClick={()=> signOut()} className='sign-out'>Sign Out</button>
        </>
        :
        <>
        <button onClick={()=> googleSignIn()} className="SignIn-google">Sign In With Google</button>
        </>
        }
      </div>
     
    </div>
  );
}

export default App;
