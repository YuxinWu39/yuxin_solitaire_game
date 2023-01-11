import React, {useState} from "react";
import {useNavigate} from 'react-router-dom';

export const Edit = props => {
    let navigate = useNavigate();
    const [state, setState] = useState({
        first_name: props.firstname,
        last_name: props.lastname,
        city: props.city,
    });
    const [editError] = useState("");

    const onSubmit = async (event) => {
        event.preventDefault();
        const response = await fetch(`/v1/user`, {
            method: 'PUT',
            body: JSON.stringify(state),
            headers: {
                'content-type': 'application/json'
            }
        });
        if (response.ok) {
            navigate(`/profile/${props.username}`);
        }
    }

    const onClick = (event) => {
        setState({
            ...state,
            [event.target.name]: event.target.value
        });
    }

    return (
        <div className="row" style={{marginTop: "50px"}}>
            <div className="col-sm-12 mx-auto">
                <div id="errorMsg" className="bg-danger" style={{textAlign: "center"}}>{editError}</div>
            </div>
            <div className="col-sm-8 offset-sm-2">
                <form className="form-horizontal">
                    <div className="form-group row">
                        <label className="col-sm-3 col-form-label" htmlFor="first_name">First Name:</label>
                        <div className="col-sm-9">
                            <input className="form-control" id="first_name" name="first_name" type="text"
                                   placeholder="First Name" defaultValue={state.first_name} onChange={onClick}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-3 col-form-label" htmlFor="last_name">Last Name:</label>
                        <div className="col-sm-9">
                            <input className="form-control" id="last_name" name="last_name" type="text"
                                   placeholder="Last Name" defaultValue={state.last_name} onChange={onClick}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <label className="col-sm-3 col-form-label" htmlFor="city">City:</label>
                        <div className="col-sm-9">
                            <input className="form-control" id="city" name="city" type="text"
                                   placeholder="City" defaultValue={state.city} onChange={onClick}/>
                        </div>
                    </div>
                    <div className="form-group row">
                        <div className="offset-sm-3 col-sm-9">
                            <button id="submitBtn" className="btn btn-primary" type="submit"
                                    onClick={onSubmit}>Update
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className="col-sm-2"/>
        </div>
    );
}