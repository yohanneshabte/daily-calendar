class SideBar {
    #populatedSidebar = false;

    constructor() {
        $('#sidebar').hide();
    }    
    openSidebar(arcNo) {
        $('#sidebar').show("slide", { direction: "right" }, 4000);
        var e = window.event;
        //$('#sidebar-title').html(e.path[0].nextSibling.textContent);
        const date = new Date();
        const formattedDate = date.toLocaleString("en-GB", {
            weekday: 'long',
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        $('#sidebar-title').html(formattedDate);
    }

    closeSidebar(){
        $('#sidebar').hide("slide", { direction: "left" }, 4000);
    }

    populateSidebar(input) {
        if(!this.populatedSidebar)
            for(var i=0; i<input.length; i++) {
                //$('#accordion').append('<div>hello</div>');  
                $('<div/>', {
                    "class": 'card',
                    "id": `card${i}`,
                }).appendTo('#accordion');
    
                $('<div/>', {
                    "class": 'card-header',
                }).appendTo(`#card${i}`);
    
                $('<h5/>', {
                    "class": 'mb-0 justify-content-between d-flex w-100',
                }).appendTo(`#card${i} div`);
    
                var buttonString = '<button class="btn btn-link collapsed" data-toggle="collapse" data-target="#collapse'+i+'">'+input[i][0]+'</button>';
                $(buttonString).appendTo(`#card${i} div h5`);
    
                var timeString = input[i][1] + ' - ' + input[i][2];
                $('<span class="badge bg-secondary">'+timeString+'</span>').appendTo(`#card${i} div h5`);
                $('<div/>', {
                    "class": 'collapse',
                    "id": `collapse${i}`,
                    "data-parent": '#accordion',
                }).appendTo(`#card${i}`);
    
                var bodyString = '<div class="card-body">';
                bodyString += "Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. 3 wolf moon officia aute, non cupidatat skateboard dolor brunch. Food truck quinoa nesciunt laborum eiusmod. Brunch 3 wolf moon tempor, sunt aliqua put a bird on it squid single-origin coffee nulla assumenda shoreditch et. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident. Ad vegan excepteur butcher vice lomo. Leggings occaecat craft beer farm-to-table, raw denim aesthetic synth nesciunt you probably haven't heard of them accusamus labore sustainable VHS.";
                bodyString += "</div>";
                $(bodyString).appendTo(`#collapse${i}`);
            }
        this.populatedSidebar = true;
    }
}