$(function () {
    let something_changed = false
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/chrome");
    editor.session.setMode("ace/mode/python");
    editor.setOptions({
        fontSize: "12pt"
    })
    let selected_id = -1

    $('#add-item').on('click', () =>{
        if(something_changed && save_before_change()){
            save_curreent_element(selected_id, $('#title').val(), editor.getValue())
            
        }
        $('#title').val('')
        $('#title').attr('placeholder','Title...')
        editor.setValue('')
        selected_id = -1
    })

    $('#btn-save').on('click', () =>{
        if(!something_changed){
            return
        }
        console.log("save clicked")
        save_curreent_element(selected_id, $('#title').val(), editor.getValue(), true)
    })
     function save_curreent_element(id, title, content, reset_selected_id=false){
        eel.modify_code(id, title,content)((element) =>{
            if(id == -1){
                let ui_el = '<a class="list-group-item py-1" href="#" data-id="'+element['id']+'" >'+element['title']+'</a>'
                $('#item-list').append(ui_el)
            }else{
                 $('#item-list').children('.list-group-item').each(function(){
                    if($(this).attr('data-id')==id){
                        $(this).html(title)
                    }
                 })
            }
            
            something_changed = false
            if(reset_selected_id){
                selected_id = element['id']
            }
        })
    }
    $(window).on("resize", () => {
        editor.resize()
    })

    $('#btn-delete').on('click', () => {
        console.log("delete clicked")
        something_changed = false
        if(selected_id == -1){
            $('#title').val("")
            editor.setValue("")
            return
        }
        $('#item-list').children('.list-group-item').each(function(){
            if($(this).attr('data-id')==selected_id){
                $(this).remove()
            }
         })
        eel.delete_code(selected_id)(() =>{
            $('#title').val("")
            selected_id = -1
            editor.setValue("")
        })  
    })
    $('#title').on('keypress',()=>{
        something_changed = true
    })
    $(editor.textInput.getElement()).on('keydown', () => {
        something_changed = true
    })


    $('#search').on('keydown', (e) =>{
        //if(e.which == 13){
            eel.search($('#search').val())((codes) =>{
                $('#item-list').empty()
                codes.forEach(element => {
                    let ui_el = '<a class="list-group-item py-1" href="#" data-id="'+element['id']+'" >'+element['title']+'</a>'
                    $('#item-list').append(ui_el)
                });
                if(codes.length > 0){
                    $('#title').val(codes[0]['title'])
                    selected_id = codes[0]['id']
                    editor.setValue(codes[0]['content'])
                }
            })
        //}
    })

    $('#item-list').on('click', 'a', function(el) {
        if(something_changed && save_before_change()){
            save_curreent_element(selected_id, $('#title').val(), editor.getValue()) 
        }
        console.log('Element clicked')
        eel.get_code($(el.target).attr('data-id'))((code) =>{
            $('#title').val(code['title'])
            selected_id = code['id']
            editor.setValue(code['content'])
            editor.moveCursorTo(0,0)
        })
    })

    function setup(){
        eel.get_all_codes()((codes) =>{
            $('#item-list').empty()
            codes.forEach(element => {
                let ui_el = '<a class="list-group-item py-1" href="#" data-id="'+element['id']+'" >'+element['title']+'</a>'
                $('#item-list').append(ui_el)
            });
            $('#title').val(codes[0]['title'])
            selected_id = codes[0]['id']
            
            editor.setValue(codes[0]['content'])
            editor.moveCursorTo(0,0)
        })
    }
    setup()

    function save_before_change(){
        return confirm("Save cahnges?")
    }


    
});


