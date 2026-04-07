Users(
    user_id (pk)
    password
    role (Admin / Faculty / Student)
)

Students(
    student_id (pk, fk → Users.user_id)
    contact_no
    college_email
    personal_email
    residence_address
    join_date
    department_id (fk → Departments.dept_id)
    discipline_id (fk → Discipline.discipline_id)
)


Faculty(
    faculty_id (pk, fk → Users.user_id)
    contact_no
    email
    department_id (fk → Departments.dept_id)
)

Faculty_Advisor(
    student_id (pk,fk referencing from Student(student_id))
    faculty_id (fk referencing from Faculty(faculty_id))
)

Leave_Requests(
    request_id (pk)
    student_id (fk → Students.student_id)
    start_date
    end_date
    reason
    status
)

On_leave(
    student_id (fk)
    start_date
    end_date
    PRIMARY KEY(student_id,start_date)
)

Departments(
    dept_id (pk)
    dept_name
    head_dept_id (fk referencing from Faculty(faculty_id))
)

Discipline(
    discipline_id (pk) (either B.Tech,M.Tech,DD,ITEP,PHD)
    max_semester (8 for B.Tech, 10 for DD, 4 for M.Tech, 8 for ITEP, 10 for PHD)
    fees
)

Courses(
    course_id (pk)
    course_name
    department_id (fk referencing from Departments(dept_id))
    credits
)

Prerequisites(
    main_course_id (fk → Courses.course_id)
    prereq_course_id (fk → Courses.course_id)
    PRIMARY KEY(main_course_id, prereq_course_id)
)

Course_Offerings(
    course_offering_id (pk)
    faculty_id (fk referencing from Faculty(faculty_id))
    course_id (fk referencing from Course(course_id))
    semester
    discipline_id (fk referencing from Discipline(discipline_id))
    capacity
)

Course_Alloted(
    student_id (fk → Students.student_id)
    course_offering_id (fk → Course_Offerings.course_offering_id)
    mid_sem_marks
    end_sem_marks
    PRIMARY KEY(student_id,course_offering_id)
)

Attendance(
    student_id (fk → Students.student_id)
    course_offering_id (fk → Course_Offerings.course_offering_id)
    date
    status
    PRIMARY KEY(student_id,course_offering_id,date)
)


Grades(
    student_id (fk referencing from Students(student_id))
    course_offering_id (fk referencing from Course_Offerings(course_offering_id))  (pk composite student_id,course_offering_id)
    grade (either EX or A or B or C or D or E or P or F)
)

Feedback(
    student_id (fk referencing from Students(student_id))
    course_offering_id (fk referencing from Course_Offerings(course_offering_id)) (pk composite student_id,course_offering_id)
    feedback
)

Rooms(
    building_name (either LHL,RHL,UHL,SECS,SBS,SMS,SIF,SEOCS,SMMME,SHSS,LBC)
    room_number (pk is composite of building_name and room_number)
    capacity
)

Scheduled_class(
    course_offering_id (fk → Course_Offerings.course_offering_id)
    start_time
    end_time
    day
    building_name
    room_number
    PRIMARY KEY(course_offering_id, day, start_time)
    FOREIGN KEY (building_name, room_number)
        REFERENCES Rooms(building_name, room_number)
)

Fee_Payment(
    payment_id (pk)
    student_id (fk referencing from Student(student_id))
    amount_paid
    total_amount
    payment_date
)

Fee_Remission_Application(
    student_id (fk referencing from Student(student_id))
    application_id (pk)
    status (between requested,Approved,disapproved)
)

Supplementary_exams(
    student_id (fk referencing from Student(student_id))
    course_offering_id (fk referencing from Course_Offerings(course_offering_id)) (pk composite student_id,course_offering_id)
    price
)

Backlogs(
    student_id (fk referencing from Student(student_id))
    course_id (fk referencing from Course(course_id)) (pk composite student_id,course_id)
)