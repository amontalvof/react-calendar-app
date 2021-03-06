import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from 'react-modal';
import DateTimePicker from 'react-datetime-picker';
import moment from 'moment';
import Swal from 'sweetalert2';
import { uiCloseModal } from '../../actions/ui';
import {
    eventStartAddNew,
    eventClearActiveEvent,
    eventStartUpdate,
} from '../../actions/events';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

if (process.env.NODE_ENV !== 'test') {
    Modal.setAppElement('#root');
}

const now = moment().minutes(0).seconds(0).add(1, 'hours');
const nowPlus1 = now.clone().add(1, 'hours');

const initEvent = {
    title: '',
    notes: '',
    start: now.toDate(),
    end: nowPlus1.toDate(),
};

export const CalendarModal = () => {
    const { modalOpen } = useSelector((state) => state.ui);
    const { activeEvent } = useSelector((state) => state.calendar);
    const dispatch = useDispatch();
    const [dateStart, setDateStart] = useState(now.toDate());
    const [dateEnd, setDateEnd] = useState(nowPlus1.toDate());
    const [titleValid, setTitleValid] = useState(true);
    const [formValues, setFormValues] = useState(initEvent);

    const { notes, title, start, end } = formValues;
    useEffect(() => {
        if (activeEvent) {
            setFormValues(activeEvent);
            setDateStart(activeEvent.start);
            setDateEnd(activeEvent.end);
        } else {
            setFormValues(initEvent);
            setDateStart(initEvent.start);
            setDateEnd(initEvent.end);
        }
    }, [activeEvent, setFormValues]);

    const handleInputChange = ({ target }) => {
        setFormValues({
            ...formValues,
            [target.name]: target.value,
        });
    };

    const closeModal = () => {
        dispatch(uiCloseModal());
        dispatch(eventClearActiveEvent());
        setFormValues(initEvent);
    };

    const handleStartDateChange = (event) => {
        setDateStart(event);
        setFormValues({
            ...formValues,
            start: event,
        });
    };

    const handleEndDateChange = (event) => {
        setDateEnd(event);
        setFormValues({
            ...formValues,
            end: event,
        });
    };

    const handleSubmitForm = (event) => {
        event.preventDefault();
        const momentStart = moment(start);
        const momentEnd = moment(end);

        if (momentStart.isSameOrAfter(momentEnd)) {
            return Swal.fire(
                'Error!',
                'The finish date must be greater than the start date.',
                'error'
            );
        }

        if (title.trim().length < 2) {
            return setTitleValid(false);
        }

        if (activeEvent) {
            dispatch(eventStartUpdate(formValues));
        } else {
            dispatch(eventStartAddNew(formValues));
        }

        setTitleValid(true);
        closeModal();
    };

    return (
        <Modal
            isOpen={modalOpen}
            // onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            closeTimeoutMS={200}
            className="modal"
            overlayClassName="modal-fondo"
            ariaHideApp={!process.env.NODE_ENV === 'test'}
        >
            <h1>{activeEvent ? 'Edit event' : 'New event'} </h1>
            <hr />
            <form className="container" onSubmit={handleSubmitForm}>
                <div className="form-group">
                    <label>Start date and time</label>
                    <DateTimePicker
                        onChange={handleStartDateChange}
                        value={dateStart}
                        className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label>Finish date and time</label>
                    <DateTimePicker
                        onChange={handleEndDateChange}
                        value={dateEnd}
                        minDate={dateStart}
                        className="form-control"
                    />
                </div>

                <hr />
                <div className="form-group">
                    <label>Title and notes</label>
                    <input
                        type="text"
                        className={`form-control ${
                            !titleValid && 'is-invalid'
                        }`}
                        placeholder="Event title"
                        name="title"
                        autoComplete="off"
                        value={title}
                        onChange={handleInputChange}
                    />
                    <small id="emailHelp" className="form-text text-muted">
                        A short description
                    </small>
                </div>

                <div className="form-group">
                    <textarea
                        type="text"
                        className="form-control"
                        placeholder="Notes"
                        rows="5"
                        name="notes"
                        value={notes}
                        onChange={handleInputChange}
                    ></textarea>
                    <small id="emailHelp" className="form-text text-muted">
                        Additional Information
                    </small>
                </div>

                <button
                    type="submit"
                    className="btn btn-outline-primary btn-block"
                >
                    <i className="far fa-save"></i>
                    <span> Save</span>
                </button>
            </form>
        </Modal>
    );
};
