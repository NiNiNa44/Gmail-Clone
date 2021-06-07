document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#starred').addEventListener('click', () => load_mailbox('star'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  $('#compose-form').submit(send_email);

  //sidebar-toggle
  $('#sidebar-toggle').click(() => sidebar_toggle());

  // By default, load the inbox
  load_mailbox('inbox');



});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  //document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => display_emails(mailbox, emails))

}

function display_emails(mailbox, emails) {
  document.getElementById('emails-view').innerHTML='';
  
  
  emails.forEach(email => {
    let user;
    let archived;
    let star_style = email.starred ? 'star' : 'star_border';
    if (mailbox === 'inbox') {
      user = email.sender;
      archived = false;
    }
    else if (mailbox === 'sent') {
      user = email.recipients;
      archived = 'none';
    }
    else if (mailbox === 'archive') {
      user = email.sender;
      archived = true;
    }

    else if (mailbox === 'star') {
      user = email.sender;
      archived = 'none';
    }

    //create element
    let content = email.body;
    content = content.substring(0, 80);
    let row = $('<div class="row emails-row"></div>');
    let row_nobtn = $('<div class="col-8"></div>');
    row_nobtn.append(`
    <div class="row">
    <div class="col-4">${user}</div>
    <div class="col"><b>${email.subject}</b> - ${content}</div>
    </div>`);

    //left buttons
    let row_select = $('<div class="select-btn col ml-2"></div>');
    let select_btn = $('<button class="material-icons">check_box_outline_blank</btn>');
    let star_btn = $(`<button class="material-icons">${star_style}</btn>`);
    row_select.append(star_btn);
    row_select.append(select_btn);

    star_btn.click(() => {
      star(email.id, email.starred);
      load_mailbox(mailbox);
    });
    
    
    
    /*
    row_nobtn.append(
      `<div class="select-btn col-1 ml-2">
      <i class="material-icons">check_box_outline_blank</i>
      <i class="material-icons">star_border</i>
      </div>
      <div class="col-3">${user}</div>
      <div class="col"><b>${email.subject}</b> - ${content}</div>`);
      */
    row.append(row_select);
    row.append(row_nobtn);


    //btn list and timestamp
    let time = display_time(email.readable_time);
    let btn_list = $('<div class="col-2 btn-list"></div>');
    let timestamp = $(`<div class="timestamp">${time}</div>`);
    btn_list.append(timestamp);

    if (archived != 'none') {
      
      //button variables
      let archive_btn = $('<button class="icon-btn" style="display:none"></button>');
      let delete_btn = $('<button class="icon-btn" style="display:none"><span class="material-icons">delete</span></button>');
      let read_btn = $('<button class="icon-btn" style="display:none"><span class="material-icons">drafts</span></button>');
      let snooze_btn = $('<button class="icon-btn" style="display:none"><span class="material-icons">schedule</span></button>');
      
      if (archived) {
        archive_btn.append(
          `<i class="material-icons">unarchive</i>`);
      }
      else {
        archive_btn.append('<i class="material-icons">archive</i>');
      }

      //append all buttons to button list
      btn_list.append(archive_btn);
      btn_list.append(delete_btn);
      btn_list.append(read_btn);
      btn_list.append(snooze_btn);
      
  
      //mouse over
      row.mouseover(function() {
        archive_btn.css('display', 'block');
        timestamp.css('display', 'none');
        delete_btn.css('display', 'block');
        read_btn.css('display', 'block');
        snooze_btn.css('display', 'block');
      })
      row.mouseout(function() {
        archive_btn.css('display', 'none');
        timestamp.css('display', 'block');
        delete_btn.css('display', 'none');
        read_btn.css('display', 'none');
        snooze_btn.css('display', 'none');

      })

      //archive
      archive_btn.click(e => {
        archive(email.id, archived);
        row.css('display', 'none'); 
      });
      
  
    }
    //view individual email
    row_nobtn.click(() => display_email(email.id))

    //append all elements in #emails-view 
    row.append(btn_list);
    $('#emails-view').append(row);

    
    
  });

}

function star(id, starred) {

  fetch(`/emails/${id}`,{
      method: 'PUT',
      body: JSON.stringify({
          starred: !starred
      })
    });
}

function display_star(id, star_btn) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    let star_style = email.starred ? 'star' : 'star_border';
    star_btn.append(star_style);
  });

}

function display_email(id) {
  $('#email-view').empty();

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(display_time(email.readable_time));
    $('#emails-view').css('display', 'none');
    $('#email-view').css('display', 'block');
    $('#compose-view').css('display', 'none');
    
    let sender_int = email.sender[0].toUpperCase();
    

    //html
    $('#email-view').append(`
      <h4>${email.subject}</h4>
      <div class="row">
        <div class="col-1">
          <button class='circle'>${sender_int}</button>
        </div>
        <div class="col">
          <p style="font-size: 0.9rem;"><b>${email.timestamp}</b></p>
          <p>
            to ${email.recipients}
            <button id="info" class="material-icons icon-btn">arrow_drop_down</button>
          </p>
        </div>
        <div class="col" style="text-align: right;">
          <p class="text-muted mt-4">${email.timestamp}  
            <span id="email-star-icn" class="material-icons icon-btn">star_outline</span>
            <span id="email-reply-icn" class="material-icons icon-btn">reply</span>
          </p>
        </div>
      </div>
      <hr>

      <div class="row">
        <p style="margin-left: 9.5%;">${email.body}</p>
      </div>
    `)


    let email_btn_row = $('<div id="email-btns"></div>')
    let reply_btn = $('<button class="pr-3 mr-2 btn btn-outline-secondary" style="margine-left: 30rem"><span class="material-icons ml-1">reply</span>Reply</button>');
    let forward_btn = $('<button class="pr-3 btn btn-outline-secondary"><span class="material-icons ml-1">forward</span>Forward</button>');
    email_btn_row.append(reply_btn);
    email_btn_row.append(forward_btn);
    $('#email-view').append(email_btn_row);

    reply_btn.click(() => reply(email));
  });
}

function reply(email) {
  console.log(email);

  $('#compose-recipients').attr('placeholder', email.sender);
  $('#compose-recipients').prop('disabled', 'true');
  $('#compose-subject').attr('placeholder', `Re: ${email.subject}`);
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
}

function archive(id, archived) {
  fetch(`/emails/${id}`,{
    method: 'PUT',
    body: JSON.stringify({
        archived: !archived
    })
  });

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(response => console.log(response));


  

}

function send_email() {

  //prevent from directing to default page
  event.preventDefault();

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
    .then((response) => response.json())
    .then(() => load_mailbox('sent'))
    .catch(error => console.log(error));
  
}

function sidebar_toggle() {

  
  if($('#sidebar').css('display') != 'none') {
    $('#sidebar').css('display', 'none');
  }
  else {
    $('#sidebar').css('display', 'block');
  }
  
}

function display_time(timestamp) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
  ];

  let datetime = timestamp.split(',');
  let date = datetime[0].split('/');
  let time = datetime[1];

  let cur_time = new Date();
  let cur_y = cur_time.getFullYear();
  let cur_m = cur_time.getMonth();
  let cur_d = cur_time.getDate();

  if (cur_y != date[2]) {
    return date;
  }
  else if (cur_d != date[1]) {
    console.log(date[1]);
    console.log(cur_d);
    return date[0] + "/" + date[1];
  }

  else {
    return time;
  }


}
