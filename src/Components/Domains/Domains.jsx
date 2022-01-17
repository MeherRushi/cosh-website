import './Domains.scss'

import React, {useState, useEffect, useRef} from 'react'
import { useLocation } from 'react-router-dom'
import { getFirestore, collectionGroup, collection, getDocs, Timestamp, where} from 'firebase/firestore/lite';

import il_plus from '../../Assets/il_plus.svg';
import il_minus from '../../Assets/il_minus.svg';
import ProjectCards from '../ProjectCards/ProjectCards';
import Loading from '../Loading/Loading';

import db from '../Firebase'

import { RiArrowDropDownLine } from 'react-icons/ri';

async function getProjects(db, id) {
    const projectsCol = collection(db, 'domains/' + id + '/projects');
    const projectSnapshot = await getDocs(projectsCol);
    var domainProjectList = projectSnapshot.docs.map(doc => {
        return {...doc.data(), id: doc.id}
    });
    return domainProjectList;
}

async function getData(db) {
    const domainsCol = collection(db, 'domains');
    const domainSnapshot = await getDocs(domainsCol);
    var domainList = await domainSnapshot.docs.map(async doc => {
        return {...doc.data(), id: doc.id, projects: await getProjects(db, doc.id)}
    });

    return {domainList};
  }

function Domains() {

    const [loading, setLoading] = useState(true);

    const [active, setActive] = useState(1);
    const [open, setOpen] = useState(1);
    const [topBarOpen, setTopBarOpen] = useState(false);
    const [domainList, setDomainList] = useState([]);

    useEffect(() => {
        console.log(domainList);
    }, [domainList]);

    useEffect(() => {
        if(window.innerWidth <= 1200) setTopBarOpen(true);
        // console.log(window.innerWidth);
    }, [])

    const ref = useRef()

    const location = useLocation()
    // console.log(location);

    useEffect(() => {
        if(location.state!=null){
            const { goto } = location.state
            // console.log("goto: "+goto);
            setActive(goto);
        }
      }, [location.state]);

    useEffect(() => {
        const checkIfClickedOutside = e => {
          if (topBarOpen && ref.current && !ref.current.contains(e.target)) {
            setTopBarOpen(false)
          }
        }
    
        document.addEventListener("mousedown", checkIfClickedOutside)
    
        return () => {
          // Cleanup the event listener
          document.removeEventListener("mousedown", checkIfClickedOutside)
        }
      }, [topBarOpen])

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [active]);

    useEffect(() => {

        getData(db).then(
            ({domainList})=>{

                Promise.all(domainList).then(
                    (d) => {
                        console.log('d ', d);
                        d = d.sort(
                            (a, b) => a['name'] > b['name'] ? 1 : -1
                        );
                        setDomainList(d);
                        setLoading(false);
                    }
                )
            }
        )
    }, []); 

    useEffect(() => {
        topBarOpen 
        ? document.body.style.overflow = 'hidden'
        : document.body.style.overflow = 'unset';
     }, [topBarOpen ]);

    // const domains = ['Artificial Intelligence', 'Blockchain', 'Development', 'Electric Vehicles', 'Game Development', 'Networking', 'Robotics', 'Security', 'Systems' ];

    function changeDomain(d) {
        setActive(d);
        setTopBarOpen(false);
    }

    return (
        loading ? <Loading/> :
        <div className="domainsDiv">
            <div className={`topBar ${topBarOpen ? "open" : ""}`} ref={ref}>
                <div className="topBarHeader">
                    <h3 onClick={() => setTopBarOpen(!topBarOpen)}>{domainList[active-1] ? domainList[active-1].name : ''}</h3>
                    <RiArrowDropDownLine className={`dropdownIcon ${topBarOpen ? "open" : ""}`} size={30} />
                </div>
                <div className={`topBarOptions ${topBarOpen ? "open" : ""}`}>
                    { domainList.map(
                        (d, i)=> <p className={`${active===i+1 ? "active" : ""}`} key={i} onClick={() => changeDomain(i+1)}>{d ? d.name : ''}</p>
                    ) }
                </div>
            </div>
            <div className="left">
                { domainList.map(
                    (d, i)=> <h3 className={`${active===i+1 ? "active" : ""}`} key={i} onClick={() => setActive(i+1)}>{d ? d.name : ''}</h3>
                ) }
                
                {/* <h3 className={`${active===2 ? "active" : ""}`} onClick={() => setActive(2)}>Systems</h3>
                <h3 className={`${active===3 ? "active" : ""}`} onClick={() => setActive(3)}>Networking</h3>
                <h3 className={`${active===4 ? "active" : ""}`} onClick={() => setActive(4)}>Development</h3>
                <h3 className={`${active===5 ? "active" : ""}`} onClick={() => setActive(5)}>Blockchain</h3>
                <h3 className={`${active===6 ? "active" : ""}`} onClick={() => setActive(6)}>Robotics</h3>
                <h3 className={`${active===7 ? "active" : ""}`} onClick={() => setActive(7)}>Electric Vehicles</h3>
                <h3 className={`${active===8 ? "active" : ""}`} onClick={() => setActive(8)}>Game Development</h3>
                <h3 className={`${active===9 ? "active" : ""}`} onClick={() => setActive(9)}>Security</h3> */}
            </div>
            <div className="right">
                <h1>{domainList.length > 0 ? domainList[active-1].name : ''}</h1>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

                <div className="projectsDiv">
                    <h2>Projects</h2>
                    <div className="expandableBar" onClick={()=>open === 1 ? setOpen(0) : setOpen(1)}>
                        <button>Ongoing Projects</button>
                        <img src={open===1 ? il_minus : il_plus} className="il_plus" alt="Illustration" />
                    </div>  
                    <div className={`content ${open===1 ? "show" : "hide"}`}>
                        <ProjectCards projects={domainList[active-1] ? domainList[active-1].projects : []} ongoing={true} domainId={domainList[active-1].id} />
                    </div>
                    <hr />
                    <div className="expandableBar" onClick={()=>open === 2 ? setOpen(0) : setOpen(2)}>
                        <button>Past Projects</button>
                        <img src={open===2 ? il_minus : il_plus} className="il_plus" alt="Illustration" />
                    </div>  
                    <div className={`content ${open===2 ? "show" : "hide"}`}>
                        <ProjectCards projects={domainList[active-1] ? domainList[active-1].projects : []} ongoing={false} domainId={domainList[active-1].id} />
                    </div>
                    <hr />
                </div>
            </div>
        </div>
    )
}

export default Domains