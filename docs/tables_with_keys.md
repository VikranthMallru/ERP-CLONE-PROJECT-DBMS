User(
    user_id (pk)
    password (should have atleast 1 capital letter, 1 alpha-numeric charecter and 1-special charecter)
    Roles VARCHAR
)

Roles(
    role_id (in 0(Admin),1(Faculty),2(Student))
    user_id (pk,fk referencing from user(user_id))
)

Students(
    student_id (pk)
    contact no. (10 digit phone number)
    college email
    personal email
    residence address
    join_date
    department_id  (fk referencing from Department(dept_id))
    discipline_id  (fk referencing from Discipline(discipline_id))
)


Faculty(
    faculty_id (pk)
    contact no.
    email
    department_id (fk referencing from Department(dept_id))
)

Faculty_Advisor(
    student_id (pk,fk referencing from Student(student_id))
    faculty_id (fk referencing from Faculty(fk))
)

Leave_Requests(
    student_id (pk,fk referencing from Student(student_id))
    start_date
    end_date
    reason
    status (either requested,approved,disapproved)
)

On_leave(
    student_id (pk,fk referencing from Student(student_id))
    start_date
    end_date
)

Departments(
    dept_id (pk)
    dept_name
    head_dept_id (fk referencing from Faculty(faculty_id))
)

Discipline(
    discipline_id (pk) (either B.Tech,M.Tech,DD,ITEP,PHD)
    fees
)

Courses(
    course_id (pk)
    course_name
    department_id (fk referencing from Department(dept_id))
    credits
)

Prerequisites(
    main_course_id (fk referencing from Course(course_id))
    prereq_course_id (fk referencing from Course(course_id))
)

Course_Offerings(
    course_offering_id (pk)
    faculty_id (fk referencing from Faculty(faculty_id))
    course_id (fk referencing from Course(course_id))
    semester (between 1 to 8 for B.Tech, between 1 to 10 for DD, between 1 to 4 for M.Tech, between 1 to 8 for ITEP, between 1 to 10 for PHD)
    capacity
)

Course_Alloted(
    course_offering_id (pk,fk referencing from Course_Offerings(course_offering_id))
    student_id (fk referencing from Student(student_id))
    attendance
    Mid_sem_Marks
    End_sem_Marks
)

Admin(
    admin_id (pk)
)

Grades(
    student_id (fk referencing from Student(student_id))
    course_offering_id (fk referencing from Course_Offerings(course_offering_id))  (pk composite student_id,course_offering_id)
    grade (either EX or A or B or C or D or E or P or F)
)

Feedback(
    student_id (fk referencing from Student(student_id))
    course_offering_id (fk referencing from Course_Offerings(course_offering_id)) (pk composite student_id,course_offering_id)
    feedbaack
)

Rooms(
    building_name (either Lalitgiri,Ratnagiri,Udayagiri,SECS,SBS)
    room_number (pk)
    capacity
)

Scheduled_class(
    course_id (fk referencing from Course(course_id))
    start_time
    end_time
    day (between Monday to Friday(included))
    room_number (fk referncing from Romms(room_number))
)

Fee_Payment(
    student_id (pk,fk referencing from Student(student_id))
    amount_paid
    total_amount
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